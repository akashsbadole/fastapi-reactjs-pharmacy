import sqlite3

def check_admin_2fa():
    conn = sqlite3.connect('pharmacy.db')
    cursor = conn.cursor()
    
    try:
        # Check all users
        cursor.execute('SELECT id, username, role, two_factor_enabled, two_factor_secret, otp_enabled, otp_secret FROM users')
        users = cursor.fetchall()
        
        print(f'Found {len(users)} users:')
        for user in users:
            print(f'ID: {user[0]}, Username: {user[1]}, Role: {user[2]}')
            print(f'  2FA Enabled: {user[3]}, 2FA Secret: {"Set" if user[4] else "None"}')
            print(f'  OTP Enabled: {user[5]}, OTP Secret: {"Set" if user[6] else "None"}')
            print()
            
            # If this is an admin user with 2FA enabled, update it
            if user[2] == 'ADMIN' and user[3] == 1:
                print(f'Disabling 2FA for admin user {user[1]}...')
                cursor.execute('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?', (user[0],))
                conn.commit()
                print('2FA disabled for admin user.')
            
            # If this is an admin user with OTP enabled, update it
            if user[2] == 'ADMIN' and user[5] == 1:
                print(f'Disabling OTP for admin user {user[1]}...')
                cursor.execute('UPDATE users SET otp_enabled = 0, otp_secret = NULL WHERE id = ?', (user[0],))
                conn.commit()
                print('OTP disabled for admin user.')
                
    finally:
        conn.close()

if __name__ == '__main__':
    check_admin_2fa()