from models.mahasiswa_model import (
    get_all_mahasiswa_with_school,
    get_mahasiswa_by_nim,
    get_mahasiswa_paginated,
    get_tahun_masuk
)

from models.judul_ta_model import get_judul_ta_by_nim

from flask import jsonify, request
import re
from config.db import get_db

def get_statistics():
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        
        # Get total students
        cur.execute("SELECT COUNT(*) as total FROM mahasiswa")
        total_result = cur.fetchone()
        total_students = total_result["total"] if total_result else 0
        
        # CORRECTED: Get students with at least one thesis (non-null/non-empty)
        cur.execute("""
            SELECT COUNT(DISTINCT j.nim) as with_thesis 
            FROM judul_ta j 
            WHERE j.judul IS NOT NULL 
            AND j.judul != ''
            AND TRIM(j.judul) != ''
        """)
        thesis_result = cur.fetchone()
        with_thesis = thesis_result["with_thesis"] if thesis_result else 0
        
        # Get unique schools
        cur.execute("SELECT COUNT(DISTINCT id_sekolah) as unique_schools FROM mahasiswa WHERE id_sekolah IS NOT NULL")
        schools_result = cur.fetchone()
        unique_schools = schools_result["unique_schools"] if schools_result else 0
        
        # Get unique years
        cur.execute("SELECT COUNT(DISTINCT tahun_masuk) as unique_years FROM mahasiswa")
        years_result = cur.fetchone()
        unique_years = years_result["unique_years"] if years_result else 0
        
        cur.close()
        db.close()
        
        return jsonify({
            "status": "success",
            "data": {
                "total_students": total_students,
                "with_thesis": with_thesis,
                "unique_schools": unique_schools,
                "unique_years": unique_years
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500

def validate_nim(nim):
    """Validate NIM format"""
    if not nim or not isinstance(nim, str):
        return False
    # Example: NIM should be alphanumeric, 8-20 characters
    return re.match(r'^[A-Za-z0-9]{8,20}$', nim) is not None

def validate_search_input(search):
    """Prevent SQL injection in search"""
    if not search:
        return True
    # Allow only alphanumeric, spaces, and basic punctuation
    return re.match(r'^[A-Za-z0-9\s\-\.\,]{0,100}$', search) is not None

def all_mahasiswa_join():
    try:
        data = get_all_mahasiswa_with_school()
        return jsonify({
            "status": "success",
            "count": len(data),
            "data": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500

def detail_mahasiswa(nim):
    if not validate_nim(nim):
        return jsonify({
            "status": "error",
            "message": "Invalid NIM format"
        }), 400
    
    try:
        mahasiswa = get_mahasiswa_by_nim(nim)

        if not mahasiswa:
            return jsonify({
                "status": "error",
                "message": "Mahasiswa tidak ditemukan"
            }), 404

        ta_list = get_judul_ta_by_nim(nim)

        return jsonify({
            "status": "success",
            "data": {
                "mahasiswa": mahasiswa,
                "judul_ta": ta_list
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500

def mahasiswa_paginated():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        
        # Validate page and limit
        if page < 1 or limit < 1 or limit > 100:
            return jsonify({
                "status": "error",
                "message": "Invalid page or limit parameter. Limit max 100."
            }), 400
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "Invalid page or limit parameter"
        }), 400

    search = request.args.get("search", "")
    tahun_masuk = request.args.get("tahun_masuk", "")
    sort_by = request.args.get("sort_by", "tahun_masuk")  # tahun_masuk, nama, nim
    sort_order = request.args.get("sort", "asc")  # asc / desc
    
    # Validate inputs
    if not validate_search_input(search):
        return jsonify({
            "status": "error",
            "message": "Invalid search input"
        }), 400
    
    if tahun_masuk and not tahun_masuk.isdigit():
        return jsonify({
            "status": "error",
            "message": "Invalid tahun_masuk format"
        }), 400
    
    if sort_order not in ['asc', 'desc']:
        sort_order = 'asc'

    try:
        data, total_pages = get_mahasiswa_paginated(
            page, limit, search, tahun_masuk, sort_by, sort_order
        )

        return jsonify({
            "status": "success",
            "page": page,
            "total_pages": total_pages,
            "data": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500


def tahun_list():
    try:
        tahun = get_tahun_masuk()
        return jsonify({
            "status": "success",
            "data": tahun
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500
