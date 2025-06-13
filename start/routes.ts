/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const BookingsController = () => import('#controllers/bookings_controller')

router.get('/', [BookingsController, 'index'])
