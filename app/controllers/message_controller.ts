import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class MessageController {

    public async backHome({ response, session }: HttpContext) {
        const user = session.get('user');
        if (!user) {
            return response.redirect().toRoute('pages/auth');
        }
        await db.from('users').where('id', user.id).update({ hasMessage: 0 });
        user.hasMessage = 0;
        return response.redirect().toRoute('/profile', { user });
    }

    public async sendMessage({ request, session, response }: HttpContext) {
        if (request.method() === 'POST') {
            const messageText = request.input('message');
            const contact = request.input('contact');
            const sender = session.get('user');
            const contactId = await db.from('users').where('username', contact).select('id').first();

            if (messageText === "") {
                return "Bitte gib eine Nachricht ein.";
            }

            await db.table('messages').insert({
                sender_id: sender.id,
                receiver_id: contactId.id,
                message: messageText,
                receiver_name: contact
            });

            const user = session.get('user');

            await db.from('users').where('id', contactId.id).update({
                hasMessage: 1
            });

            return response.redirect().toRoute('/contacts');
        }
    }

    public async getMessage({ view, params, session }: HttpContext) {
        const contact = params.id;
        const contactUser = await db.from('users').where('username', contact).select('username').first();
        const contactId = await db.from('users').where('username', contact).select('id').first();
        const user = session.get('user');

        await db.from('users').where('id', contactId.id).update({
            hasMessage: 0
        });

        const messages = await db.from('messages')
            .join('users', 'messages.sender_id', '=', 'users.id')
            .where((query) => {
                query.where('messages.receiver_id', user.id).andWhere('messages.sender_id', contactId.id)
                    .orWhere('messages.sender_id', user.id).andWhere('messages.receiver_id', contactId.id)
            })
            .orderBy('messages.created_at', 'asc')
            .select('messages.*', 'users.username', 'users.profile_picture');

        const users = await db.from('users')
            .whereIn('id', [user.id, contactId.id])
            .select('*');

        return view.render('pages/message', { messages, contact, user, contactUser, users, contactId });
    }
}
