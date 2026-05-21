from app.helpers import compute_citizen_hash


def test_compute_hash_matches_keccak_format():
    h = compute_citizen_hash("12345678", "ssc-antipereza-2026-publico")
    assert h.startswith("0x")
    assert len(h) == 66  # 0x + 64 hex


def test_compute_hash_deterministic():
    h1 = compute_citizen_hash("12345678", "salt")
    h2 = compute_citizen_hash("12345678", "salt")
    assert h1 == h2


def test_compute_hash_differs_per_dni():
    h1 = compute_citizen_hash("12345678", "salt")
    h2 = compute_citizen_hash("87654321", "salt")
    assert h1 != h2


def test_compute_hash_differs_per_salt():
    h1 = compute_citizen_hash("12345678", "salt_a")
    h2 = compute_citizen_hash("12345678", "salt_b")
    assert h1 != h2
