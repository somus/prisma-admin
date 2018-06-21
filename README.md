# Prisma Admin
A clean GUI to manage prisma's graphql API data.

![Prisma admin screenshot](https://raw.githubusercontent.com/somus/prisma-admin/master/screenshot.png)

### Motivation
I recently started learning graphql and was playing around with it. So, I eventually came across [prisma](https://prisma.io) and started using it. While the graphiql editor which comes with it is great for testing the queries and mutations. It is not intuitive for creating or managing data. So, I started playing around with the introspection query and made prisma-admin.

### How it works
Prisma admin uses the introspection query to fetch the schema details for the given prisma endpoint from the cli. Then, it filters the query and list all the main types from the schema in the nav bar. Each type page shows a paginated list of available data where you have the option and add, edit & delete data.

### Getting started

```
yarn global add prisma-admin
prisma-admin PRISMA_ENDPOINT
```

### Development
To start the development server,
```
git clone https://github.com/somus/prisma-admin.git
cd prisma-admin
yarn install
yarn start
```

### TODO
- [ ] Add tests
