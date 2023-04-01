defmodule FabricHookWeb.FabricLive do
  use Phoenix.LiveView,
    layout: {FabricHookWeb.LayoutView, "live.html"}

  import FabricHookWeb.Gettext

  @impl true
  def mount(params, session, socket) do
    {:ok, assign(socket, page: "fabric")}
  end

  @impl true
  def render(%{page: "loading"} = assigns) do
    ~H"""
    <div><%= gettext("The page is loading, please wait...") %></div>
    """
  end

  @impl true
  def render(%{page: page} = assigns) do
    Phoenix.View.render(FabricHookWeb.LiveView, "page_" <> page <> ".html", assigns)
  end

end
