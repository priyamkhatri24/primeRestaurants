class APIfeatures {
  constructor(request, queryObj) {
    this.request = request;
    this.queryObj = queryObj;
  }

  filter() {
    const excludedQueries = ["sort", "page", "feilds", "limit"];
    let queryObjString = JSON.stringify(this.queryObj);

    queryObjString = queryObjString.replace(
      /(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const queryObj = JSON.parse(queryObjString);
    excludedQueries.forEach((ele) => delete queryObj[ele]);
    this.request.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.request = this.request.sort(sortBy);
    }
    return this;
  }

  limit() {
    if (this.queryObj.feilds) {
      const feilds = this.queryObj.feilds.split(",").join(" ");
      console.log(feilds);
      this.request = this.request.select(feilds);
    }
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 100;
    const skiped = (page - 1) * limit;
    this.request = this.request.skip(skiped).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;
