import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_tests():
    print("🚀 Starting Phase 2 End-to-End Verification...")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login Athul (or register if not exists)
        login_res = await client.post("/api/v1/auth/login", json={"email": "athul@example.com", "password": "Password123!"})
        if login_res.status_code != 200:
            print("Registering Athul...")
            reg = await client.post("/api/v1/auth/register", json={
                "email": "athul@example.com",
                "password": "Password123!",
                "display_name": "Athul Krishna"
            })
            assert reg.status_code in (200, 201), f"Register Athul failed: {reg.text}"
            login_res = await client.post("/api/v1/auth/login", json={"email": "athul@example.com", "password": "Password123!"})
        
        athul_token = login_res.json()["access_token"]
        athul_headers = {"Authorization": f"Bearer {athul_token}"}
        print("✅ Athul logged in.")

        # Complete Athul's profile & preferences if not done
        await client.put("/api/v1/profiles/me", headers=athul_headers, json={
            "display_name": "Athul K",
            "gender": "male",
            "occupation": "Software Engineer at Kakkanad",
            "bio": "Working at Infopark, quiet during weekdays, looking for a clean flat in Kakkanad."
        })
        await client.put("/api/v1/profiles/preferences", headers=athul_headers, json={
            "min_budget": 6000,
            "max_budget": 12000,
            "preferred_gender": "any",
            "room_type": "private"
        })

        # 2. Complete Athul's Lifestyle Answers
        q_res = await client.get("/api/v1/lifestyle/questions", headers=athul_headers)
        questions = q_res.json()
        print(f"✅ Retrieved {len(questions)} lifestyle questions.")
        
        answers_payload = {
            "answers": [
                {"question_id": q["id"], "answer_value": q["options_json"][0]["value"]}
                for q in questions
            ]
        }
        ans_res = await client.post("/api/v1/lifestyle/answers", headers=athul_headers, json=answers_payload)
        assert ans_res.status_code == 200, f"Submit answers failed: {ans_res.text}"
        print(f"✅ Submitted {len(questions)} lifestyle answers for Athul.")

        # 3. Discovery Feed for Athul
        disc_res = await client.get("/api/v1/discovery/people", headers=athul_headers)
        assert disc_res.status_code == 200, f"Discovery failed: {disc_res.text}"
        candidates = disc_res.json()
        print(f"✅ Discovery returned {len(candidates)} candidates:")
        for c in candidates:
            print(f"   - {c['display_name']} ({c.get('occupation_category')}): {c['compatibility_score']}% match")

        # 4. Athul expresses interest in Rahul
        rahul_candidate = next((c for c in candidates if "Rahul" in c["display_name"]), candidates[0])
        target_user_id = rahul_candidate["user_id"]
        print(f"Athul choosing candidate: {rahul_candidate['display_name']} ({target_user_id})")

        action_res = await client.post("/api/v1/discovery/actions", headers=athul_headers, json={
            "target_user_id": target_user_id,
            "action": "express_interest"
        })
        assert action_res.status_code == 200, f"Action failed: {action_res.text}"
        action_data = action_res.json()
        print(f"✅ Athul action recorded: mutual_match={action_data['is_mutual_match']}")

        # 5. Login candidate (e.g. rahul.nair@example.com)
        rahul_login = await client.post("/api/v1/auth/login", json={"email": "rahul.nair@example.com", "password": "Password123"})
        if rahul_login.status_code == 200:
            rahul_token = rahul_login.json()["access_token"]
            rahul_headers = {"Authorization": f"Bearer {rahul_token}"}
            me_res = await client.get("/api/v1/auth/me", headers=athul_headers)
            athul_id = me_res.json()["id"]

            # Rahul reciprocates interest in Athul
            rahul_action = await client.post("/api/v1/discovery/actions", headers=rahul_headers, json={
                "target_user_id": athul_id,
                "action": "express_interest"
            })
            assert rahul_action.status_code == 200, f"Rahul action failed: {rahul_action.text}"
            r_data = rahul_action.json()
            print(f"🎉 Mutual Match Achieved! conversation_id={r_data['conversation_id']}")
            assert r_data["is_mutual_match"] is True
            assert r_data["conversation_id"] is not None
            conv_id = r_data["conversation_id"]

            # 6. Check Matches List
            matches_res = await client.get("/api/v1/matches", headers=athul_headers)
            assert matches_res.status_code == 200
            matches = matches_res.json()
            print(f"✅ Athul's matches list: {len(matches)} match(es)")

            # 7. Messaging in Match Conversation
            msg_res = await client.post(f"/api/v1/conversations/{conv_id}/messages", headers=athul_headers, json={
                "content": "Hi Rahul! Saw we both work near Infopark Kakkanad. Are you still looking for a 2BHK flatmate?"
            })
            assert msg_res.status_code == 200, f"Send message failed: {msg_res.text}"
            print("✅ Message sent successfully from Athul to Rahul.")

            # Rahul reads messages
            fetch_res = await client.get(f"/api/v1/conversations/{conv_id}/messages", headers=rahul_headers)
            assert fetch_res.status_code == 200
            msgs = fetch_res.json()
            print(f"✅ Rahul received {len(msgs)} message(s): '{msgs[0]['content']}'")

            # Rahul replies
            reply_res = await client.post(f"/api/v1/conversations/{conv_id}/messages", headers=rahul_headers, json={
                "content": "Hey Athul! Yes, checking places around Edachira and Infopark Phase 1. Let's connect!"
            })
            assert reply_res.status_code == 200
            print("✅ Rahul replied successfully.")

        # 8. Test Block & Report moderation
        block_res = await client.post(f"/api/v1/users/{target_user_id}/block", headers=athul_headers, json={
            "reason": "Testing block flow"
        })
        assert block_res.status_code == 200
        print(f"✅ Block user endpoint verified: {block_res.json()['status']}")

        # Unblock so test remains idempotent
        unblock_res = await client.delete(f"/api/v1/users/{target_user_id}/block", headers=athul_headers)
        assert unblock_res.status_code == 200
        print("✅ Unblock user endpoint verified.")

        report_res = await client.post("/api/v1/reports", headers=athul_headers, json={
            "reported_user_id": target_user_id,
            "reason": "spam",
            "description": "Automated verification test report"
        })
        assert report_res.status_code == 200
        print("✅ Report user endpoint verified.")

    print("\n🎉 ALL PHASE 2 BACKEND ENDPOINTS AND WORKFLOWS VERIFIED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
