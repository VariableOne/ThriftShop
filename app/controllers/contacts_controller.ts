'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"


export default class ContactsController {
    sendingPerson: any;

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

            // Holen aller Nachrichten, um die Sender zu identifizieren
                const message = await db.from('messages')
                .join('users', 'messages.sender_id', '=', 'users.id')
                .where('messages.receiver_id', user.id)
                .orWhere('messages.sender_id', user.id)
                .orderBy('messages.created_at', 'desc')
                .first();

            //Name des Senders wird mitgegeben, um dann den jeweiligen Kontakt anzeigen lassen zu können
                const sendingPerson = message.sender_name;

    
            return view.render('pages/contacts', { message, users, contact, sendingPerson });
        
    }

    
    public async deleteMessages({ params, response, session }: HttpContext) {
   
          const contact = params.id;
          const user = session.get('user');
          //Finde den korrekten Sender, bzw. Kontakt
          const contactId = await db.from('users').where('username', contact).select('id').first();
          // Lösche alle Nachrichten für den angegebenen Kontakt
          await db
          .from('messages')
          .where((builder) => {
            builder.where('sender_id', user.id).andWhere('receiver_id', contactId.id)
          })
          .orWhere((builder) => {
            builder.where('sender_id', contactId.id).andWhere('receiver_id', user.id)
          })
          .delete()
          //wieder zurück zur Kontaktseite
          return response.redirect().back()
        } 
      }
    
    
    
