from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from openai_chatkit import ChatKitServer, Event, stream_widget
from openai_chatkit.models import (
    ThreadMetadata, UserMessageItem, ClientToolCallOutputItem, 
    Card, Button, Text, ActionConfig, Row, Box, Divider, Caption
)
from openai_chatkit.store import SQLiteStore
from openai import AsyncOpenAI
import os
from typing import AsyncIterator, Any

app = FastAPI()

apiKey = os.environ.get("OPENAI_API_KEY", "")

# --- URL CONFIGURATION ---
URLS = {
    "RESERVE_TABLE": "https://widget.openflow.pro/66c87551e1bc2f3d2a7ae1b7",
    "RESERVE_SOUL": "https://widget.openflow.pro/66c87551e1bc2f3d2a7ae1b7?event=39f99b22-9294-4c54-9327-4e9f8625036b",
    "RESERVE_JAZZ": "https://widget.openflow.pro/66c87551e1bc2f3d2a7ae1b7?event=773e4bd1-761b-4767-a2c6-7d867b51278f",
    "MENU": "https://www.grandcafedelaposte.restaurant/grandcafedelapos/?page_id=273",
    "CONTACT": "mailto:relationcommerciale.group@gmail.com" 
}

class GCDLPServer(ChatKitServer):
    def __init__(self, data_store, file_store=None):
        super().__init__(data_store, file_store)
        self.client = AsyncOpenAI(api_key=apiKey)

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        
        user_text = ""
        if isinstance(input, UserMessageItem):
            user_text = input.content[0].text.lower()

        # Intent Detection Logic
        is_music = any(word in user_text for word in ["jazz", "soul", "concert", "musique", "soirée", "live"])
        is_menu = any(word in user_text for word in ["carte", "menu", "plat", "manger", "faim"])
        is_event = any(word in user_text for word in ["privé", "groupe", "anniversaire", "mariage", "event"])
        
        assistant_text = "Voici les options disponibles pour votre demande :"
        yield Event(type="message", content=assistant_text)

        # Dynamic Widget Construction
        widget_children = []

        if is_music:
            widget_children.append(self.create_row("Soirée Soul", "Dîners Friday Soul", "Réservez", URLS["RESERVE_SOUL"]))
            widget_children.append(Divider(color="#EBE3D0"))
            widget_children.append(self.create_row("Soirée Jazz", "Dîners Sunday Jazz", "Réservez", URLS["RESERVE_JAZZ"]))
        elif is_menu:
            widget_children.append(self.create_row("La Carte", "Découvrez nos plats", "Menu", URLS["MENU"]))
        elif is_event:
             widget_children.append(self.create_row("Événements", "Contactez notre équipe", "Contact", URLS["CONTACT"]))
        else:
            widget_children.append(self.create_row("Réservez votre table", "Petit déjeuner - déjeuner - dîner", "Réservez", URLS["RESERVE_TABLE"]))

        widget = Card(
            size="sm",
            background="#FEF9EE",
            padding=4,
            children=[
                 Row(align="center", children=[
                    Text(value="Votre Concierge Digital", size="sm", weight="semibold", color="#978550")
                 ]),
                 Divider(color="#978550"),
                 *widget_children
            ]
        )

        async for event in stream_widget(thread, widget):
            yield event

    def create_row(self, title, subtitle, button_label, url):
        return Row(
            align="center",
            gap=3,
            children=[
                Box(flex="auto", children=[
                    Text(value=title, size="sm", weight="semibold", color="emphasis"),
                    Caption(value=subtitle, color="secondary")
                ]),
                Button(
                    label=button_label,
                    size="sm",
                    onClickAction=ActionConfig(type="link.open", payload={"url": url})
                )
            ]
        )

# --- CRITICAL FIX: Use In-Memory Database for Vercel ---
# Vercel does not allow writing to files (read-only system)
# We use ":memory:" to tell SQLite to run in RAM only.
data_store = SQLiteStore(db_path=":memory:")
server = GCDLPServer(data_store)

@app.post("/api/chatkit")
async def chatkit_endpoint(request: Request):
    body = await request.body()
    result = await server.process(body, {})
    return StreamingResponse(result, media_type="text/event-stream")
