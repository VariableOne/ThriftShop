'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"


export default class ContactsController {

    public async getContact({ view, session }: HttpContext) {
        try {
            const user = session.get('user');
            if (!user) {
                return view.render('pages/auth');
            }
    
            // Holen der Benutzer, deren Nachrichten an den aktuellen Benutzer gesendet wurden
            const users = await db.from('messages')
                .join('users', 'messages.sender_name', '=', 'users.username')
                .where('messages.receiver_id', user.id)
                .distinct('users.id', 'users.username')
                .select('users.*');

                console.log(users);
    
            return view.render('pages/contacts', { users });
        } catch (error) {
            console.error("Error fetching users:", error);
            return view.render('error', { error });
        }
    }
    
    
    
}