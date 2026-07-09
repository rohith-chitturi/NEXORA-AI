from pydantic import BaseModel

class DealFinderState(BaseModel):
    product_id: str = ""
    best_deal_found: str = ""

class DealFinderAgent:
    def __init__(self, llm):
        self.llm = llm

    def process(self, state: DealFinderState) -> DealFinderState:
        # Mock logic
        state.best_deal_found = "Found a 20% discount coupon: NEXORA20"
        return state
