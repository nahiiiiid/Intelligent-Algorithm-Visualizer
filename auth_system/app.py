from flask import Flask, render_template, request, redirect, session, url_for, flash, jsonify, send_from_directory
import mysql.connector
from config import *
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = 'secretkey'

# Connect to MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB
    )

# 1. API to get logged-in user info
@app.route('/get_user')
def get_user():
    if 'user_id' in session:
        return jsonify({'loggedIn': True, 'username': session['username']})
    else:
        return jsonify({'loggedIn': False})

# 2. Route to serve main index.html
@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')  # adjust path if needed

# 3. Serve static files (CSS, JS, algorithm folders, etc.)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../', filename)

# 4. Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                           (username, email, password))
            conn.commit()
            flash('Registered successfully! Please login.')
            return redirect(url_for('login'))
        except mysql.connector.Error as err:
            flash(f'Error: {err}')
        finally:
            cursor.close()
            conn.close()
    return render_template('register.html')

# 5. Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('serve_index'))  # redirect to your visualizer homepage
        else:
            flash('Invalid credentials. Please try again.')

    return render_template('login.html')

# 6. Logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# 7. (Optional) dashboard route if needed
@app.route('/dashboard')
def dashboard():
    if 'user_id' in session:
        return render_template('dashboard.html', username=session['username'])
    else:
        return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
