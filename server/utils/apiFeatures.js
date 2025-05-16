class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Basic filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering (with operators like gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Text search
  search() {
    if (this.queryString.search) {
      const searchTerms = this.queryString.search
        .split(",")
        .map((term) => term.trim());

      if (searchTerms.length > 0) {
        // Create OR conditions for search across multiple fields
        const searchConditions = searchTerms.map((term) => ({
          $or: [
            { title: { $regex: term, $options: "i" } },
            { description: { $regex: term, $options: "i" } },
            { stateName: { $regex: term, $options: "i" } },
          ],
        }));

        // Add search to query with AND between terms
        this.query = this.query.find({ $and: searchConditions });
      }
    }
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by most recent
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // Exclude internal fields
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
