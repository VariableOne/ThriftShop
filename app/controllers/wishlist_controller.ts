// SearchController.ts

'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class WishlistController {

    public async getWishlist({ view, session }: HttpContext) {

      const wishAds = await db
      .from('newad')
      .innerJoin('users', 'newad.user_id', 'users.id')
      .select('newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'newad.wishlist', 'users.*');

       
      return view.render('pages/wishlist',  { newads: wishAds });
    }
    public async addedToWishlist({ response, request, session }: HttpContext) {
      try {
          const title = request.input('wishlist');
          
          await db.from('newad').where('title', title).update({ wishlist: 1 });

      const wishAds = await db
      .from('newad')
      .innerJoin('users', 'newad.user_id', 'users.id')
      .select('newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'newad.wishlist', 'users.*');


          return response.redirect().toRoute('/wishlist', {userAds: wishAds});
      } catch (error) {
          console.error('Fehler beim Hinzufügen zur Wishlist:', error);
          return response.status(500).send({ error: 'Interner Serverfehler.' });
      }
  }
  
}
