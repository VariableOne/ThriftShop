/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import UsersController from '#controllers/users_controller';
import ProfileController from '#controllers/profile_controller';
import NewadController from '#controllers/newad_controller';
import SearchController from '#controllers/search_controller';
import MessageController from '#controllers/message_controller';

router.on('/').render('pages/auth');


router.get('/registration', [UsersController, 'registerForm']);
router.post('/registration', [UsersController, 'registerProcess']);

router.get('/auth', [UsersController, 'loginForm']);
router.post('/auth', [UsersController, 'loginProcess']);

router.get('/home',[UsersController, 'switchToProfile']);
router.post('/home',[UsersController, 'logout']);

router.get('/profile', [ProfileController, 'getHome']);
router.post('/profile', [ProfileController, 'updateProfilePicture']);

router.get('/logout', [UsersController, 'logout']);

router.post('/newad', [NewadController, 'create']);
router.get('/newad',[NewadController, 'getNewad']);

router.post('/search', [SearchController, 'deactivateAd']); 
router.get('/search', [SearchController, 'getSearchResults']);

router.get('/message/:id', [SearchController, 'contactPerson']);

router.post('/message',[MessageController, 'sendMessage']);

router.get('/mailbox',[MessageController, 'receiveMessage']);

router.post('/mailbox',[MessageController, 'backHome']);


