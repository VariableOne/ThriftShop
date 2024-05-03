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

    public async sendMessage({ request, session, response }: HttpContext) {

        // Nachrichtendaten aus dem Formular oder der Anfrage erhalten
        const subject = request.input('subject');
        const message = request.input('message');
        const receiver = request.input('receiver');
        // Absender (aktuell angemeldeter Benutzer) aus der Sitzung erhalten
        const sender = session.get('user');
    
        // Empfänger Id finden
        const receiver_name= await db.from('users').where('username', receiver).select('id').first();
        const name = await db.from('users').where('username', sender.username).select('username').first();

        await db.table('messages').insert({
            sender_id: sender.id,
            receiver_id: receiver_name.id,
            subject: subject,
            message: message,
            sender_name: name.username
        });

        const user = session.get('user');
        const userAds = await db.from('newad').where('user_id', user.id).select('*');
        const messagedPerson =  await db.from('users').where('id', receiver_name.id).first();
        await db.from('users').where('id', receiver_name.id).update({hasMessage: 1}).first();

        const userAdsArray = userAds.map(ad => ({
            id: ad.id,
            state: ad.state,
            title: ad.title,
            price: ad.price,
            adress: ad.adress,
            image: ad.fileName,
            description: ad.description,
            deactivated: 0,
            hasMessage: messagedPerson.hasMessage
        }));

        console.log(messagedPerson.hasMessage);

        return response.redirect().toRoute('/profile', {user, userAds: userAdsArray});
    }

    public async receiveMessage({ session, view }: HttpContext) {
  
        const user = session.get('user');
        if (!user) {
            return view.render('pages/auth');
        }
        const receiver_name= await db.from('users').where('username', user.username).select('id').first();
        const messagedPerson =  await db.from('users').where('id', receiver_name.id).first();
    
        const messages = await db.from('messages')
                                .where('receiver_id', messagedPerson.id)
                                .orderBy('created_at', 'asc')
                                .select('*');

        return view.render('pages/mailbox', { messages, user });
    }

}
