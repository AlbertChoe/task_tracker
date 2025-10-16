def paginate(query, page: int, size: int):
    page = max(page, 1)
    size = max(min(size, 100), 1)
    offset = (page - 1) * size
    return query.offset(offset).limit(size)
