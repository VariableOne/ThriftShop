import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class MessageController {

    public async sendMessage({ request, session, response }: HttpContext) {
        const user = session.get('user');
        if (!user) {
            return response.redirect().toRoute('pages/auth');
        }

        /*Nur wenn es einen POST-Requets ist, ansonsten wird in der Datenbank 
        immer wieder beim Neuladen der Seite derselbe Eintrag gespeichert*/

        if (request.method() === 'POST') {
            const messageText = request.input('message');
            const contact = request.input('contact');
            const sender = session.get('user');
            const contactId = await db.from('users').where('username', contact).select('id').first();
            const user = session.get('user');

            await db.table('messages').insert({
                sender_id: sender.id,
                receiver_id: contactId.id,
                message: messageText,
                receiver_name: contact,
                sender_name: user.username
            });

            // Integer (boolean-ersatz) wird auf 1 gesetzt beim Empfänger, sobald der Sender die Nachricht abschickt
            await db.from('users').where('id', contactId.id).update({
                hasMessage: 1
            });

            return response.redirect().toRoute('/contacts');
        }
    }

    public async getMessage({ view, params, session, response }: HttpContext) {

        const user = session.get('user');
        if (!user) {
            return response.redirect().toRoute('pages/auth');
        }
        
        const contact = params.id;
        const contactUser = await db.from('users').where('username', contact).select('username').first();
        const contactId = await db.from('users').where('username', contact).select('id').first();

        // Wenn der Empfänger die Nachricht öffnet, wird hasMessage wieder false, also 0
        await db.from('users').where('id', user.id).update({ hasMessage: 0 });
        user.hasMessage = 0;

        //Es werden nur die Nachrichten geladen, die zwischen user a und user b stattfanden, sonst sind alle Nachrichten vermischt
        const messages = await db.from('messages')
            .join('users', 'messages.sender_id', '=', 'users.id')
            .where((query) => {
                query.where('messages.receiver_id', user.id).andWhere('messages.sender_id', contactId.id)
                    .orWhere('messages.sender_id', user.id).andWhere('messages.receiver_id', contactId.id)
            })
            .orderBy('messages.created_at', 'asc')
            .select('messages.*', 'users.username', 'users.profile_picture');

        //Nur user a und user b dabei mitgeben, bzw. dessen profildaten unter anderem
        const users = await db.from('users')
            .whereIn('id', [user.id, contactId.id])
            .select('*');  

        return view.render('pages/message', { messages, contact, contactUser, users, contactId, user });
    }

}
