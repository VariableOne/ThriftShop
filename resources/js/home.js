 document.addEventListener('DOMContentLoaded', function() {
        var uploadLink = document.getElementById('search');
        uploadLink.addEventListener('click', function(event) {
          var searchTerm = document.getElementById("searchInput").value.trim();
        if (searchTerm === "") {
          
          document.getElementById("search_not_empty").style.display = "block";
        }
        else if(searchTerm !== ""){
        window.location.href = '/search'}});
    });