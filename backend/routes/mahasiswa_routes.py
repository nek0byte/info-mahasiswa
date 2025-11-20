from flask import Blueprint
from controllers.mahasiswa_controller import (
        all_mahasiswa_join,
        detail_mahasiswa, 
        mahasiswa_paginated,
        tahun_list
)

mahasiswa_bp = Blueprint('mahasiswa_bp', __name__)

@mahasiswa_bp.route('/', methods=['GET'])
def get_all():
    return all_mahasiswa_join()

@mahasiswa_bp.route('/join', methods=['GET'])
def get_join():
    return all_mahasiswa_join()

@mahasiswa_bp.route('/paginated', methods=['GET'])
def paginated():
    return mahasiswa_paginated()

@mahasiswa_bp.route('/tahun', methods=['GET'])
def get_tahun():
    return tahun_list()

@mahasiswa_bp.route('/<string:nim>', methods=['GET'])
def get_detail(nim):
    return detail_mahasiswa(nim)
