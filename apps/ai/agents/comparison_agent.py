from pydantic import BaseModel

class ComparisonAgentState(BaseModel):
    product_ids: list[str] = []
    comparison_result: str = ""

class ComparisonAgent:
    def __init__(self, llm):
        self.llm = llm

    def process(self, state: ComparisonAgentState) -> ComparisonAgentState:
        # Mock logic
        state.comparison_result = "Product A has better battery, while Product B has a better screen."
        return state
