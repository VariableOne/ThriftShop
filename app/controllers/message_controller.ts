'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"


export default class MessageController {

    public async backHome({ response, session }: HttpContext){

        const user = session.get('user');
        if (!user) {
            return response.redirect().toRoute('pages/auth');
        }
        await db.from('users').where('id', user.id).update({ hasMessage: 0 });

        user.hasMessage = 0;

        return response.redirect().toRoute('/profile', {user});

    }

    public async sendMessage({ request, session, view }: HttpContext) {

        // Nachrichtendaten aus dem Formular oder der Anfrage erhalten
        const messageText = request.input('message');
        const contact = request.input('contact');
        // Absender (aktuell angemeldeter Benutzer) aus der Sitzung erhalten
        const sender = session.get('user');
        const contactUser = await db.from('users').where('id', contact).select('username').first();
        // Nachricht in der Datenbank speichern
        await db.table('messages').insert({
            sender_id: sender.id,
            receiver_id: contact,
            message: messageText,
            sender_name: contactUser
        });

        // Benutzer- und Nachrichtendaten abrufen
        const user = session.get('user');
        const messages = await db.from('messages')
            .where('sender_id', contact)
            .where('receiver_id', user.id)
            .orWhere('sender_id', user.id)
            .where('receiver_id', contact)
            .orderBy('created_at', 'asc')
            .select('*');

        return view.render('pages/message', {messages, user, contactUser, contact });
    }

    public async receiveMessage({ params,session, view }: HttpContext) {
  
        const user = session.get('user');
        if (!user) {
            return view.render('pages/auth');
        }
        const contact = params.id;

        const contactUser = await db.from('users').where('id', contact).select('username').first();
        
        // Holen der Nachrichten, die zwischen dem aktuellen Benutzer und dem ausgewählten Kontakt ausgetauscht wurden
        const messages = await db.from('messages')
            .where('sender_id', user.id)
            .where('receiver_id', contact)
            .orWhere('sender_id', contact)
            .orWhere('receiver_id', user.id)
            .orderBy('created_at', 'asc')
            .select('*');

        console.log(messages);

        return view.render('pages/message', { messages, user, contactUser, contact });
    }

}
