'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"


export default class ContactsController {

    public async getContact({ view, session, params }: HttpContext) {
            const user = session.get('user');
            if (!user) {
                return view.render('pages/auth');
            }

            const contact = params.id;
    
            // Holen der Benutzer, deren Nachrichten an den aktuellen Benutzer gesendet wurden
                 const users = await db.from('messages')
                .join('users', 'messages.sender_id', '=', 'users.id')
                .where('messages.receiver_id', user.id)
                .distinct('users.id', 'users.username')
                .select('users.*');
            
                const message = await db.from('messages')
                .join('users', 'messages.sender_id', '=', 'users.id')
                .where('messages.receiver_id', user.id)
                .orWhere('messages.sender_id', user.id)
                .orderBy('messages.created_at', 'asc')
                .first();

                console.log(users);
    
            return view.render('pages/contacts', { message, users, contact });
        
    }
    
    
    
}