// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { user } from './users/users'
import { company } from './companies/companies'
import { invoice } from './invoices/invoices'
import { collectionReminder } from './collection-reminders/collection-reminders'
export const services = (app: Application) => {
  app.configure(user)
  app.configure(company)
  app.configure(invoice)
  app.configure(collectionReminder)
}
