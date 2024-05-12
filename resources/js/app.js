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

  // Funktion zum Einblenden und Ausblenden einer Chat-Benachrichtigung
  function showNotification() {
    var notification = document.getElementById('notification');
    setTimeout(function () {
      notification.style.display = 'none';
    }, 3000); // Nach 3 Sekunden ausblenden
  }

  showNotification();

  function showImage(input) {
    // Lösche alle vorhandenen Bilder, bevor ein neues hinzugefügt wird
    document.getElementById('images-container').innerHTML = '';

    // Überprüfen, ob Dateien ausgewählt wurden
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        // Erstellen eines img-Elements und Hinzufügen des ausgewählten Bilds
        var image = document.createElement('img');
        if (image !== null) { // Typüberprüfung, um sicherzustellen, dass das Element nicht null ist
          image.src = e.target.result;
          image.style.width = '100px'; // Ändert die Breite nach Bedarf
          image.style.height = '100px'; // Ändert die Höhe nach Bedarf
          image.style.marginRight = '10px'; // Ändert den rechten Abstand nach Bedarf
          image.style.marginBottom = '10px'; // Ändert den unteren Abstand nach Bedarf
          image.style.objectFit = 'cover'; // Stellt sicher, dass das Bild den Container abdeckt
          document.getElementById('images-container').appendChild(image);
        }
      }

      reader.readAsDataURL(input.files[0]); // Ausgewählte Datei lesen und in ein Daten-URL-Format konvertieren
    }
  }

  // Event-Listener für die Änderung des Datei-Eingabefelds
  document.getElementById('upload').addEventListener('change', function () {
    showImage(this); // Die Funktion showImage aufrufen, wenn eine Datei ausgewählt wird
  });
