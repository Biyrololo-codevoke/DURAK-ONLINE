class BaseDocs:
    path: str | None = None

    @classmethod
    def gen_docs(cls):
        tab = "  "
        docs = f"{tab}{cls.path}:"

        for method in ("get", "post", "put", "patch", "delete"):
            if method in dir(cls) and callable(getattr(cls, method)):
                docs += f"\n{tab * 2}{method}:"
                for line in getattr(cls, method).__doc__.split("\n")[1:-1]:
                    docs += f"\n{tab * 3}{line.replace(tab * 4, '', 1)}"

        return docs
