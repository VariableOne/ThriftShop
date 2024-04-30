'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class MessageController {

    public async sendMessage({ request, session, view }: HttpContext) {
        // Nachrichtendaten aus dem Formular oder der Anfrage erhalten
        const { subject, message } = request.all();
    
        const receiver = request.input('receiver');
        console.log(receiver);
                // Absender (aktuell angemeldeter Benutzer) aus der Sitzung erhalten
        const sender = session.get('user');
    
        // Empfänger anhand des Benutzernamens suchen
        const receiverId = await db.from('users').where('username', receiver).select('id').first();

        console.log(receiverId);
    
        if (!receiverId) {
            // Empfänger nicht gefunden
            return 'Empfänger nicht gefunden.';
        }

          const messages = await db.table('messages').insert({
                sender_id: sender.id,
                receiver_id: receiverId.id,
                subject: subject,
                message: message
            });

        
            // Erfolgsmeldung oder Weiterleitung zurückgeben
            return view.render('pages/mailbox', {messages});
        
    }

    public async receiveMessage({session,view }: HttpContext){

        const user = session.get('user');

        // Nachrichten des Benutzers aus der Datenbank abrufen
        const messages = await db.from('messages')
                                .where('receiver_id', user.id)
                                .orderBy('created_at', 'desc')
                                .select('subject', 'message');
        
        // Nachrichten an die Ansicht übergeben
        return view.render('pages/mailbox', { messages });
        
    }
    

}