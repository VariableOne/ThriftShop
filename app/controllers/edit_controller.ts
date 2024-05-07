'use strict'

import { cuid } from "@adonisjs/core/helpers";
import { HttpContext } from "@adonisjs/core/http"
import app from "@adonisjs/core/services/app";
import db from "@adonisjs/lucid/services/db"


export default class EditController {

    public async editAd({request, response, view, session}:HttpContext){

        const user = session.get('user');

        if(!user){

           return view.render('pages/auth');
        }
        const { title, price, state, description, adress} = request.all();

        const newadId = request.input('newad');

        const newad = await db.from('newad').where('id', newadId).first();
        
        const image = request.file('upload');

        if (!image) {

            await db.from('newad').where('id', newad.id).update({
                title: title,
                price: price,
                state: state, 
                adress: adress ? adress : "Adresse nicht gegeben",
                description: description ? description : "Beschreibung nicht gegeben", // Wenn description null ist, ersetze es durch den Ersatztext
                user_id: user.id,
                deactivated: 0
            });

            const userAds = await db.from('newad').where('user_id', user.id).select('*');

            const userAdsArray = userAds.map(ad => ({
                id: ad.id,
                state: ad.state,
                title: ad.title,
                price: ad.price,
                adress: ad.adress,
                image: ad.fileName,
                description: ad.description,
                deactivated: 0
            }));
    
 
            return response.redirect().toRoute('/profile', { user, userAds: userAdsArray});
        }
        
        
        const fileName = `${cuid()}.${image.extname}`;

        await image.move(app.publicPath('uploads'), { name: fileName });

        await db.from('newad').where('id', newad.id).update({
            title: title,
            price: price,
            state: state, 
            image: fileName,
            adress: adress ? adress : "Adresse nicht gegeben",
            description: description ? description : "Beschreibung nicht gegeben", // Wenn description null ist, ersetze es durch den Ersatztext
            user_id: user.id,
            deactivated: 0
        });

        const userAds = await db.from('newad').where('user_id', user.id).select('*');

        const userAdsArray = userAds.map(ad => ({
            id: ad.id,
            state: ad.state,
            title: ad.title,
            price: ad.price,
            adress: ad.adress,
            image: ad.fileName,
            description: ad.description,
            deactivated: 0
        }));


        return response.redirect().toRoute('/profile', { user, userAds: userAdsArray});

        }

    public async getAd({view, params}: HttpContext){

        const ad = params.id;

        const newad = await db.from('newad').where('id', ad).first();

        return view.render('pages/edit', {ad, newad});

    }
}