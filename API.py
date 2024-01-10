from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load the model and other artifacts
model = joblib.load('money_laundering_model.joblib')

@app.route('/api/predict_money_laundering', methods=['POST'])
def predict_money_laundering():
    data = request.get_json()

    # Preprocess the input data if necessary (using loaded artifacts)
    preprocessed_data = preprocess_data(data['transaction_data'], scaler)  # Implement preprocess_data function

    # Make predictions using the loaded model
    prediction = model.predict(preprocessed_data)

    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(port=5000)