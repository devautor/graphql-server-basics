const { ApolloServer, gql } = require("apollo-server");

// sample data with poor schema design with no IDs
const books = [
  {
    title: "Mistakes Were Made (But Not by Me)",
    authors: ["Carol Tavris", "Elliot Aronson"]
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    authors: ["J.K. Rowling"]
  },
  {
    title: "Jurassic Park",
    authors: ["Michael Crichton"]
  }
];

const authors = [
  {
    name: "J.K. Rowling",
    books: ["Harry Potter and the Chamber of Secrets"]
  },
  {
    name: "Michael Crichton",
    books: ["Jurassic Park"]
  },
  {
    name: "Elliot Aronson",
    books: ["Mistakes Were Made (But Not by Me)"]
  },
  {
    name: "Carol Tavris",
    books: ["Mistakes Were Made (But Not by Me)"]
  }
];

// graphql typedefs
const typeDefs = gql`
  type Book {
    title: String!
    authors: [Author!]!
  }

  type Author {
    name: String
    books: [Book]
  }

  # Query type [parent]
  type Query {
    getBooks: [Book!]
    getAuthor(name: String!): Author
  }
`;

// [resolver map](https://www.apollographql.com/docs/apollo-server/essentials/data.html)

const resolvers = {
  Book: {
    title: parent => parent.title,
    authors: (parent, args, context, info) => {
      // console.log("Resolving authors");
      const authorNames = parent.authors;
      // console.log(`Authors of ${parent.title} are ${authorNames}`);
      const authorsArray = context.data.authors;
      // console.log("Authors are ", authorsArray);
      let authors = [];

      authorNames.map(authorName => {
        // console.log("\nLooking for author name ", authorName);
        let author = authorsArray.filter(author => author.name === authorName);
        // console.log("Author type object with same name field ", author);
        authors.push(...author); // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
      });
      // console.log("Resolved authors ", authors);
      return authors;
    }
  },

  Author: {
    name: (parent, args) => parent.name,
    books: (parent, args, context, info) => {
      // console.log(parent, args, context);
      const bookTitles = parent.books;
      // console.log("Books by this author are ", bookTitles);
      const booksArray = context.data.books;
      let books = [];
      bookTitles.map(bookTitle => {
        let book = booksArray.filter(book => book.title === bookTitle);
        books.push(...book);
      });
      return books;
    }
  },

  Query: {
    getBooks: () => {
      // console.log("getBooks query: Books are ", books);
      return books;
    },
    getAuthor: (parent, args, context, info) => {
      let author = context.data.authors.filter(author => {
        return author.name === args.name;
      });
      return author[0];
    }
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    data: {
      books: books,
      authors: authors
    }
  })
});

// listen method launches a web server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
