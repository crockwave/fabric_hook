defmodule FabricHook.Repo do
  use Ecto.Repo,
    otp_app: :fabric_hook,
    adapter: Ecto.Adapters.Postgres
end
