document.addEventListener('DOMContentLoaded', function() {
    // This ensures that the DOM is fully loaded before trying to attach the event listener
    console.log("hi");
    // Add event listener for button click
    var predictButton = document.getElementById('predictButton');
    if (predictButton) {
        predictButton.addEventListener('click', function() {
            predictDisease();
        });
    }
});

function predictDisease() {
    console.log("Predict Disease button clicked");

    var symptomsInput = document.getElementById('symptoms').value;
    console.log(symptomsInput);
    // Make an AJAX request to the Express server, which will forward it to the Flask backend
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/predict', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var predictions = JSON.parse(xhr.responseText);
                console.log("Predictions received:", predictions);
                displayPredictions(predictions);
            } else {
                console.error("Error in AJAX request. Status:", xhr.status);
            }
        }
    };
    xhr.send('symptoms=' + encodeURIComponent(symptomsInput));
}


function displayPredictions(predictions) {
    document.getElementById('x').style.visibility="visible";
    document.getElementById('y').style.visibility="visible";
    document.getElementById('rfPrediction').innerHTML = "<h5>Random Forest predicts:</h5> " + predictions['Random Forest'];
    document.getElementById('nbPrediction').innerHTML = "<h5>Naive Bayes predicts:</h5> " + predictions['Naive Bayes'];
    document.getElementById('svmPrediction').innerHTML = "<h5>SVM predicts:</h5> " + predictions['SVM'];
    document.getElementById('finalPrediction').innerHTML = "<h5>Final Prediction:</h5> " + predictions['Final Prediction'];
    document.getElementById('Description').innerHTML = "<h5>Description:</h5> " + predictions['Description'];
    document.getElementById('Specialist').innerHTML = "<h5>Specialist:</h5> " + predictions['Specialist'];
    document.getElementById('Precautions').innerHTML = "<h5>Precautions:</h5> " + predictions['Precautions'];
    document.getElementById('Doctors').innerHTML = "<h5>Doctors:</h5> " + predictions['Doctors'];
    document.getElementById('d1').innerHTML = "<h5>Doctor_Name:</h5> " + predictions['Name'][0];
    document.getElementById('a1').innerHTML = "<h5>Doctor_Address:</h5> " + predictions['Address'][0];
    document.getElementById('s1').innerHTML = "<h5>Doctor_Speciality:</h5> " + predictions['Speciality'][0];
    document.getElementById('d2').innerHTML = "<h5>Doctor_Name:</h5> " + predictions['Name'][1];
    document.getElementById('a2').innerHTML = "<h5>Doctor_Address:</h5> " + predictions['Address'][1];
    document.getElementById('s2').innerHTML = "<h5>Doctor_Speciality:</h5> " + predictions['Speciality'][1];
    document.getElementById('d3').innerHTML = "<h5>Doctor_Name:</h5> " + predictions['Name'][2];
    document.getElementById('a3').innerHTML = "<h5>Doctor_Address:</h5> " + predictions['Address'][2];
    document.getElementById('s3').innerHTML = "<h5>Doctor_Speciality:</h5> " + predictions['Speciality'][2];
}