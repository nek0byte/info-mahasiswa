from models.mahasiswa_model import (
        get_all_mahasiswa_with_school,
        get_mahasiswa_by_nim,
        get_mahasiswa_paginated,
        get_tahun_masuk
)
from flask import jsonify, request

def all_mahasiswa_join():
    data = get_all_mahasiswa_with_school()

    return jsonify({
        "status": "success",
        "count": len(data),
        "data": data
    })

def detail_mahasiswa(nim):
    data = get_mahasiswa_by_nim(nim)

    if not data:
        return jsonify({
            "status": "error",
            "message": "Mahasiswa tidak ditemukan"
        }), 404

    return jsonify({
        "status": "success",
        "data": data
    })

def mahasiswa_paginated():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    search = request.args.get("search", "")
    tahun_masuk = request.args.get("tahun_masuk", "")
    sort = request.args.get("sort", "asc")  # asc / desc

    data, total_pages = get_mahasiswa_paginated(page, limit, search, tahun_masuk, sort)

    return jsonify({
        "status": "success",
        "page": page,
        "total_pages": total_pages,
        "data": data
    })


def tahun_list():
    tahun = get_tahun_masuk()
    return jsonify({
        "status": "success",
        "data": tahun
    })
