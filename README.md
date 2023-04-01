# FabricHook

To start your Phoenix server for this demo:

  * Install fabric via npm from your `assets` folder
  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix

## Fabric demo

  Created with Phoenix Framework 1.6.0

  Demonstrates the following:
  * Fabric.js pdf.js and PDFLib.js LiveView integration
  * Fabric.js hook in app.js
  * Creates a new default 2 page PDF on page load using PDFLib
  * Fabric annotation layer on top of the PDF file viewer
  * Using a Fabric brush to draw objects of varying widths and colors
  * Uploading a PDF into the viewer
  * Selecting, rotating, moving and scaling drawn Fabric objects
  * Moving selected Fabric object using arrow keys and Shift-arrow keys
  * Deleting selected Fabric object using the Del key