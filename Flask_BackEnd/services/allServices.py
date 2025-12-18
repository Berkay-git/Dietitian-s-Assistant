#Burada .NET Gibi şişkin değil, sadece fonksiyonlar bulunur business logic içerir. Class , interface vs hiçbir şey yoktur.
#Objeleştirme yapar. 
#Bu genel erişim noktasıdır, bütün servisler için.


from .AuthService import AuthService

__all__ = [
    "AuthService"
]