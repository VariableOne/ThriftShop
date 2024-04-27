// SearchController.ts

'use strict'

import { HttpContext } from "@adonisjs/core/http"

export default class WishlistController {

    public async getWishlist({ view }: HttpContext) {
       
      return view.render('pages/wishlist');
    }
}
