from config.db import get_db

def get_judul_ta_by_nim(nim):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id_ta, nim, judul, tahun_masuk, deskripsi, status
        FROM judul_ta
        WHERE nim = %s
    """, (nim,))

    result = cursor.fetchall()

    cursor.close()
    db.close()
    return result
