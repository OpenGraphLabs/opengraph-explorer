import os
import numpy as np

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
import gc

# Set random seeds for reproducibility
SEED = 42
os.environ['PYTHONHASHSEED'] = str(SEED)
tf.random.set_seed(SEED)
np.random.seed(SEED)

def gpu_init():
    gc.collect()
    tf.keras.backend.clear_session()
    
    # Set deterministic operations
    tf.config.experimental.enable_op_determinism()
    
    # Disable GPU if running on M1/M2 Mac
    if tf.config.list_physical_devices('GPU'):
        try:
            # Set memory growth and deterministic GPU operations
            for gpu in tf.config.list_physical_devices('GPU'):
                tf.config.experimental.set_memory_growth(gpu, True)
            tf.config.experimental.set_synchronous_execution(True)
        except RuntimeError as e:
            print(e)

gpu_init()

NAME = "mnist_14_14"
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

train_path = os.path.join(f"../../{NAME}/data/train")
test_path = os.path.join(f"../../{NAME}/data/test")
os.makedirs(train_path, exist_ok=True)
os.makedirs(test_path, exist_ok=True)

save_path = os.path.join(f"../../{NAME}/model")
os.makedirs(save_path, exist_ok=True)

print(save_path)

# Ensure deterministic data preprocessing
tf.random.set_seed(SEED)  # Reset seed before image resizing
X_train = tf.image.resize(tf.expand_dims(X_train, -1), [14, 14]).numpy()
X_test  = tf.image.resize(tf.expand_dims(X_test,  -1), [14, 14]).numpy()

X_train = X_train.astype('float32') / 255.0
X_test  = X_test.astype('float32') / 255.0
X_train = X_train.reshape(-1, 14 * 14)
X_test  = X_test.reshape(-1, 14 * 14)

y_train = y_train.astype('int8')
y_test  = y_test.astype('int8')

# Save training and test data to the specified paths
np.save(os.path.join(train_path, 'X_train.npy'), X_train)
np.save(os.path.join(train_path, 'y_train.npy'), y_train)
np.save(os.path.join(test_path, 'X_test.npy'), X_test)
np.save(os.path.join(test_path, 'y_test.npy'), y_test)

print(f"Training data saved to: {train_path}")
print(f"Test data saved to: {test_path}")

# Set deterministic initialization for model weights
kernel_init = tf.keras.initializers.GlorotUniform(seed=SEED)
    
# Model definition with deterministic initialization
model = models.Sequential([
    layers.Dense(32, activation='relu', input_shape=(14*14,),
                kernel_initializer=kernel_init),  # Hidden layer 1
    layers.Dense(16, activation='relu',
                kernel_initializer=kernel_init),  # Hidden layer 2
    layers.Dense(10, kernel_initializer=kernel_init)  # Output layer
])

# Configure optimizer with fixed seed
optimizer = tf.keras.optimizers.Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999, epsilon=1e-07)
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer=optimizer, loss=loss_fn, metrics=['accuracy'])

# Train with fixed batch size and deterministic operations
model.fit(X_train, y_train, 
         epochs=100,
         batch_size=32,
         validation_data=(X_test, y_test),
         shuffle=True)  # Still shuffle but with fixed seed

save_path_model = os.path.join(save_path, f"{NAME}.h5")
model.save(save_path_model, save_format='h5')
print(f"Model saved at: {save_path_model}")

# Load and evaluate model
loaded_model = tf.keras.models.load_model(save_path_model)

# Model evaluation
test_loss, test_accuracy = loaded_model.evaluate(X_test, y_test)
print(f"Test Accuracy: {test_accuracy:.4f}")

# Predictions
predictions = loaded_model.predict(X_test)
predicted_classes = tf.argmax(predictions, axis=1)

# Print confusion matrix for detailed analysis
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_test, predicted_classes)
print("\nConfusion Matrix:")
print(cm)