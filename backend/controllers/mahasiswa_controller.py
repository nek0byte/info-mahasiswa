from models.mahasiswa_model import (
        get_all_mahasiswa_with_school,
        get_mahasiswa_by_nim,
        get_mahasiswa_paginated,
        get_tahun_masuk
)

from models.judul_ta_model import get_judul_ta_by_nim

from flask import jsonify, request

def all_mahasiswa_join():
    data = get_all_mahasiswa_with_school()

    return jsonify({
        "status": "success",
        "count": len(data),
        "data": data
    })

def detail_mahasiswa(nim):
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

def mahasiswa_paginated():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
    except calueError:
        return jsonify({
            "status": "error",
            "message": "Invalid page or limit parameter"
        }), 400

    search = request.args.get("search", "")
    tahun_masuk = request.args.get("tahun_masuk", "")
    sort = request.args.get("sort", "asc")  # asc / desc

    data, total_pages = get_mahasiswa_paginated (
            page, limit, search, tahun_masuk, sort
    )

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
