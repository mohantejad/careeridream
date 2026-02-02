from djoser import email

# Custom email classes for user-related emails, extending Djoser's email classes.
class ActivationEmail(email.ActivationEmail):
    # Uses a custom activation template stored in users/templates.
    template_name = 'ActivationEmail.html'

# Custom confirmation email class, extending Djoser's confirmation email class.
class ConfirmationEmail(email.ConfirmationEmail):
    # Uses a custom confirmation template stored in users/templates.
    template_name = 'ConfirmationEmail.html'
