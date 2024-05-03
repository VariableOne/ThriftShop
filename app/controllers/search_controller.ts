// SearchController.ts

'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class SearchController {


  public async getSearchResults({ request, view, session }: HttpContext) {
      const { searchInput, priceRange } = request.all();
      const user = session.get('user');
      let adsWithUsers;
  
      if (priceRange) {
          switch (priceRange) {
              case 'under10':
                  adsWithUsers = await db
                      .from('newad')
                      .where('title', 'like', `%${searchInput}%`)
                      .where('price', '<', 10)
                      .whereNot('user_id', user.id)
                      .fullOuterJoin('users', 'newad.user_id', 'users.id')
                      .select('newad.id','newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
                  break;
              case 'under50':
                  adsWithUsers = await db
                      .from('newad')
                      .where('title', 'like', `%${searchInput}%`)
                      .whereBetween('price', [10, 50])
                      .whereNot('user_id', user.id)
                      .fullOuterJoin('users', 'newad.user_id', 'users.id')
                      .select('newad.id','newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
                  break;
              case 'under500':
                  adsWithUsers = await db
                      .from('newad')
                      .where('title', 'like', `%${searchInput}%`)
                      .whereBetween('price', [50, 500])
                      .whereNot('user_id', user.id)
                      .fullOuterJoin('users', 'newad.user_id', 'users.id')
                      .select('newad.id','newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
                  break;
              case 'over500':
                  adsWithUsers = await db
                      .from('newad')
                      .where('title', 'like', `%${searchInput}%`)
                      .where('price', '>', 500)
                      .whereNot('user_id', user.id)
                      .fullOuterJoin('users', 'newad.user_id', 'users.id')
                      .select('newad.id','newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
                  break;
              default:
                  break;
          }
      } else {
          adsWithUsers = await db
              .from('newad')
              .where('title', 'like', `%${searchInput}%`)
              .whereNot('user_id', user.id)
              .fullOuterJoin('users', 'newad.user_id', 'users.id')
              .select('newad.id', 'newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
      }

      return view.render('pages/search', { newads: adsWithUsers , searchInput});
  }

 public async deactivateAd({ request, response }:HttpContext) {
 const adId = request.input('deactivate');
      
      try {
          await db.from('newad').where('id', adId).update({ deactivated: 1 });
          return response.redirect().back();
      } catch (error) {
          console.error('Error deactivating ad:', error);
          return response.status(500).send({ error: 'Internal server error.' });
      }
  }
  
  public async contactPerson({ view, params }: HttpContext) {
    // Den Wert von 'receiver' aus den Query-Parametern der Anfrage abrufen
    const receiver_id = params.id;

        // Übergebe 'receiver' und 'sender' an die Ansicht
     return view.render('pages/message', { receiver_id });
}

  }
  

