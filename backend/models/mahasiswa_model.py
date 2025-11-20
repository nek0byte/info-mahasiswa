from config.db import get_db

def get_all_mahasiswa_with_school():
    db = get_db()
    cur = db.cursor(dictionary=True)

    query = """
        SELECT 
            m.nim,
            m.nama,
            m.tahun_masuk,
            s.kode_sekolah,
            s.nama_sekolah
        FROM mahasiswa m
        LEFT JOIN sekolah_asal s
            ON m.id_sekolah = s.kode_sekolah;
    """

    cur.execute(query)
    result = cur.fetchall()

    cur.close()
    db.close()
    return result

def get_mahasiswa_by_nim(nim):
    db = get_db()
    cur = db.cursor(dictionary=True)

    query = """
        SELECT 
            m.nim,
            m.nama,
            m.tahun_masuk,
            s.kode_sekolah,
            s.nama_sekolah
        FROM mahasiswa m
        LEFT JOIN sekolah_asal s
            ON m.id_sekolah = s.kode_sekolah
        WHERE m.nim = %s
        LIMIT 1;
    """

    cur.execute(query, (nim,))
    result = cur.fetchone()

    cur.close()
    db.close()
    return result

def get_mahasiswa_paginated(page=1, limit=20, search="", tahun_masuk="", order="asc"):
    db = get_db()
    cur = db.cursor(dictionary=True)
    
    offset = (page - 1) * limit
    query = """
        SELECT m.*, s.nama_sekolah, s.kode_sekolah 
        FROM mahasiswa m 
        LEFT JOIN sekolah_asal s ON m.id_sekolah = s.kode_sekolah 
        WHERE 1=1
    """
    params = []
    
    if search:
        query += " AND (m.nama LIKE %s OR m.nim LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    if tahun_masuk:
        query += " AND m.tahun_masuk = %s"
        params.append(tahun_masuk)

    query += f" ORDER BY m.tahun_masuk {order}"
    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cur.execute(query, params)
    data = cur.fetchall()

    # Hitung total pages dengan filter yang sama
    count_q = "SELECT COUNT(*) as total FROM mahasiswa m WHERE 1=1"
    count_params = []
    
    if search:
        count_q += " AND (m.nama LIKE %s OR m.nim LIKE %s)"
        count_params.extend([f"%{search}%", f"%{search}%"])
    
    if tahun_masuk:
        count_q += " AND m.tahun_masuk = %s"
        count_params.append(tahun_masuk)
    
    cur.execute(count_q, count_params)
    total = cur.fetchone()["total"]
    total_pages = (total + limit - 1) // limit

    cur.close()
    db.close()

    return data, total_pages

def get_tahun_masuk():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT DISTINCT tahun_masuk FROM mahasiswa ORDER BY tahun_masuk ASC")
    tahun = [row[0] for row in cur.fetchall()]
    cur.close()
    db.close()
    return tahun
