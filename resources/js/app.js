console.log('Hello World')

//Das Ausklappen der Karten, bzw. der Kleinanzeige für mehr Infos
document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll("#newad-card");

    cards.forEach(card => {
      card.addEventListener("mouseover", function () {
        this.querySelector(".card-body:last-child").style.display = "block";
      });

      card.addEventListener("mouseleave", function () {
        this.querySelector(".card-body:last-child").style.display = "none";
      });
    });
  });


    //Weiterleitung zur Registrierungsseite, wenn man auf der Anmeldeseite ist
    document.addEventListener('DOMContentLoaded', function() {
    var uploadLink = document.getElementById('registrate');
    uploadLink.addEventListener('click', function(event) {
    window.location.href = '/registration';});  });
      