# Doordec URL Generator

Generates URLs for the door dec puzzle (spring 2023). The URLs contain all necessary information to identify a resident so that no sensitive information is stored on my personal website. Fields are encoded as a query string. Some fields are encoded in a URL-safe base64 implementation, but shorter fields aren't. This is done to ensure that everything is URL safe and to obscure the meaning of the URL to a small degree.
