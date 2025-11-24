import json
import csv
import requests
from typing import Any, Dict, List


def finn_kjopesentre_i_norge(access_token: str, category_id: str = "shopping_mall", limit: int = 25) -> List[Dict[str, Any]]:
    """
    Henter kjøpesentre (shopping malls) i Norge via Mapbox Search API og returnerer liste over steder.
    
    Args:
        access_token (str): Gyldig Mapbox API token.
        category_id (str): Canonical kategori‑ID i Mapbox. Standard er 'shopping_mall'.
        limit (int): Maks antall treff fra API (maks 25).
    
    Returns:
        List[dict]: Liste over kjøpesenter-data med all tilgjengelig informasjon.
    """
    if not access_token:
        raise ValueError("access_token må være satt")

    base_url = f"https://api.mapbox.com/search/searchbox/v1/category/{category_id}"
    params = {
        "access_token": access_token,
        "country": "NO",
        "language": "nb",
        "limit": limit
    }

    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()

    results: List[Dict[str, Any]] = []
    for feature in data.get("features", []):
        properties: Dict[str, Any] = feature.get("properties") or {}
        geometry: Dict[str, Any] = feature.get("geometry") or {}
        context: Dict[str, Any] = properties.get("context") or {}

        coordinates = geometry.get("coordinates") or [None, None]
        lon = coordinates[0] if len(coordinates) > 0 else None
        lat = coordinates[1] if len(coordinates) > 1 else None

        properties_coordinates = properties.get("coordinates") or {}
        eta_info = properties.get("eta") or {}

        def _json_or_empty(value: Any) -> str:
            return json.dumps(value, ensure_ascii=False) if value else ""

        name_value = (
            properties.get("name")
            or feature.get("name")
            or properties.get("name_preferred")
            or ""
        )
        name_preferred_value = (
            properties.get("name_preferred")
            or properties.get("name")
            or feature.get("name")
            or ""
        )

        result: Dict[str, Any] = {
            # Grunnleggende identifikasjon
            "mapbox_id": properties.get("mapbox_id", ""),
            "feature_type": properties.get("feature_type", ""),
            "name": name_value,
            "name_preferred": name_preferred_value,

            # Adresseinformasjon
            "full_address": properties.get("full_address", ""),
            "place_formatted": properties.get("place_formatted", ""),
            "address": properties.get("address", ""),
            "address_number": properties.get("address_number", ""),
            "street_name": properties.get("street_name", ""),

            # Koordinater
            "latitude": lat,
            "longitude": lon,
            "coordinates_accuracy": properties_coordinates.get("accuracy", ""),

            # Bounding box
            "bbox": _json_or_empty(properties.get("bbox")),

            # Context / adressekomponenter
            "country": (context.get("country") or {}).get("name", "") if context.get("country") else "",
            "country_code": (context.get("country") or {}).get("country_code", "") if context.get("country") else "",
            "region": (context.get("region") or {}).get("name", "") if context.get("region") else "",
            "region_code": (context.get("region") or {}).get("region_code", "") if context.get("region") else "",
            "postcode": (context.get("postcode") or {}).get("name", "") if context.get("postcode") else "",
            "district": (context.get("district") or {}).get("name", "") if context.get("district") else "",
            "place": (context.get("place") or {}).get("name", "") if context.get("place") else "",
            "locality": (context.get("locality") or {}).get("name", "") if context.get("locality") else "",
            "neighborhood": (context.get("neighborhood") or {}).get("name", "") if context.get("neighborhood") else "",
            "street": (context.get("street") or {}).get("name", "") if context.get("street") else "",

            # POI-spesifikke felt
            "poi_category": _json_or_empty(properties.get("poi_category")),
            "poi_category_ids": _json_or_empty(properties.get("poi_category_ids")),
            "brand": _json_or_empty(properties.get("brand")),
            "brand_id": properties.get("brand_id", ""),

            # Ytterligere metadata
            "maki": properties.get("maki", ""),
            "operational_status": properties.get("operational_status", ""),
            "language": properties.get("language", ""),
            "external_ids": _json_or_empty(properties.get("external_ids")),

            # ETA-informasjon
            "eta_duration": eta_info.get("duration", "") if eta_info else "",
            "eta_distance": eta_info.get("distance", "") if eta_info else "",

            # Routable points
            "routable_points": _json_or_empty(properties_coordinates.get("routable_points")),
        }

        results.append(result)

    return results


def lagre_til_csv(data, filnavn="mall.csv"):
    """
    Lagrer en liste med kjøpesenterdata til en CSV-fil.
    
    Args:
        data (List[dict]): Liste over POI-data.
        filnavn (str): Navn på CSV-fil som skrives.
    """
    if not data:
        print("Ingen data å lagre")
        return

    fieldnames = list(data[0].keys())

    with open(filnavn, mode="w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)


if __name__ == "__main__":
    TOKEN = "pk.eyJ1IjoiZW9uMjUyNSIsImEiOiJjbWhwODhzN2YwM3I3MnJxenh1NXhsdHhlIn0.1m6lhAXolEnhatZUYPbBYA"
    try:
        kjopesentre = finn_kjopesentre_i_norge(TOKEN, limit=25)
        lagre_til_csv(kjopesentre)
        print(f"Lagret {len(kjopesentre)} kjøpesentre til mall.csv")
        if kjopesentre:
            print(f"Felter per kjøpesenter: {len(kjopesentre[0])}")
    except Exception as e:
        print("Feil:", e)
