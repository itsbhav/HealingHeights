from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import mode
from flask_cors import CORS
import os
import csv

app = Flask(__name__)
CORS(app)

@app.route('/static/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.path.abspath(__file__))
    return send_from_directory(os.path.join(root_dir, 'static'), filename)

@app.route('/')
def index():
  symptomsArray = [
  'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing',
  'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity',
  'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
  'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety',
  'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
  'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
  'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
  'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
  'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation',
  'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
  'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
  'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise',
  'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
  'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
  'chest_pain', 'weakness_in_limbs', 'fast_heart_rate',
  'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
  'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising',
  'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
  'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
  'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips',
  'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
  'stiff_neck', 'swelling_joints', 'movement_stiffness',
  'spinning_movements', 'loss_of_balance', 'unsteadiness',
  'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort',
  'foul_smell_of urine', 'continuous_feel_of_urine', 'passage_of_gases',
  'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability',
  'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain',
  'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
  'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum',
  'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
  'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
  'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption',
  'fluid_overload', 'blood_in_sputum', 'prominent_veins_on_calf',
  'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads',
  'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails',
  'inflammatory_nails', 'blister', 'red_sore_around_nose',
  'yellow_crust_ooze'
  ]
  return render_template('index.ejs',symptomsArray=symptomsArray)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        symptoms = request.form.get('symptoms')
        predictions = predict(symptoms)
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)})

# Reading the data
DATA_PATH = "Training.csv"
PATH = "symptom_Description.csv"
PATH_1 = "specialist.csv"
PATH_2 = "doctors.csv"
PATH_3 = "details.csv"

data = pd.read_csv(DATA_PATH).dropna(axis=1)
desc=pd.read_csv(PATH)
spec=pd.read_csv(PATH_1)

# Encoding the target value into numerical value using LabelEncoder
encoder = LabelEncoder()
data["prognosis"] = encoder.fit_transform(data["prognosis"])
X = data.iloc[:, :-1]
y = data.iloc[:, -1]
disease_desc=desc.set_index('Disease').to_dict()['Description']
specialist=spec.set_index('Disease').to_dict()['Specialist']

# Training the models on the whole data
final_svm_model = SVC()
final_nb_model = GaussianNB()
final_rf_model = RandomForestClassifier(random_state=18)
final_svm_model.fit(X, y)
final_nb_model.fit(X, y)
final_rf_model.fit(X, y)

# Creating a symptom index dictionary to encode the input symptoms into numerical form
symptoms = X.columns.values
symptom_index = {symptom: index for index, symptom in enumerate(symptoms)}

# Assuming the CSV data is stored in a file named 'symptom_precaution.csv'
PATH_4 = "symptom_precaution.csv"

# Initialize an empty dictionary to store the data
disease_data = {}
doctors = {}
doctor_data = {}

# Read the CSV file and process the data
with open(PATH_4, mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Extract disease and precautions from each row
        disease = row['Disease']
        precautions = [row[f'Precaution_{i}'] for i in range(1, 5) if row[f'Precaution_{i}']]
        
        # Join precautions into a single string separated by commas
        precautions_str = ', '.join(precautions)

        # Store the data in the dictionary
        disease_data[disease] = precautions_str

# Read the CSV file and process the data
with open(PATH_3, mode='r', newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Extract doctor details from each row
        doctor_name = row['Doctors']
        address = row['Address']
        specialty = row['Speciality']

        # Store the data in the dictionary
        doctor_data[doctor_name] = {'Address': address, 'Speciality': specialty}

with open(PATH_2, mode='r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Extract disease and precautions from each row
        disease = row['Disease']
        precautions = [row[f'Doctor_{i}'] for i in range(1, 4) if row[f'Doctor_{i}']]

        # Join precautions into a single string separated by commas
        precautions_str = ', '.join(precautions)

        # Store the data in the dictionary
        doctors[disease] = precautions_str

def predict(sym):
    symp = sym.split(",")
    
    # Creating input data for the models
    input_data = [0] * len(symptoms)
    for symptom in symp:
        index = symptom_index.get(symptom)
        if index is not None:
            input_data[index] = 1
        
    # Reshaping the input data and converting it into a suitable format for model predictions
    input_data = np.array(input_data).reshape(1, -1)
        
    # Generating individual outputs
    rf_prediction = encoder.classes_[final_rf_model.predict(input_data)[0]]
    nb_prediction = encoder.classes_[final_nb_model.predict(input_data)[0]]
    svm_prediction = encoder.classes_[final_svm_model.predict(input_data)[0]]

    # Making the final prediction by taking the mode of all predictions
    all_predictions = [rf_prediction, nb_prediction, svm_prediction]
    final_prediction = max(set(all_predictions), key = all_predictions.count)
    doctors_for_disease=doctors[final_prediction]

    # Split the list into individual doctor names
    doctors_list = [doctor.strip() for doctor in doctors_for_disease.split(',')]
    address=[]
    speciality=[]
    for doctor_name in doctors_list:
        address.append(doctor_data[doctor_name]['Address'])
        speciality.append(doctor_data[doctor_name]['Speciality'])
    predictions = {
        "Random Forest": rf_prediction,
        "Naive Bayes": nb_prediction,
        "SVM": svm_prediction,
        "Final Prediction": final_prediction,
        "Description":disease_desc[final_prediction],
        "Specialist":specialist[final_prediction],
        "Precautions":disease_data[final_prediction],
        "Doctors":doctors[final_prediction],
        "Name":doctors_list,
        "Address":address,
        "Speciality":speciality
    }
    return predictions

if __name__ == '__main__':
    app.run(debug=True)
