from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
import pymysql
from django.views.decorators.csrf import csrf_exempt

from random import shuffle

import openai
import json

with open("app_dorock/config/DB_info.json", "r", encoding="utf-8") as data:
    DB_info = json.load(data)


def index(req):
    return HttpResponse("Welcome to Site of Chat GPT with Tour Api BackEnd URL")

#  ====tripInfo====


@csrf_exempt
def tripInfo(req):
    # db속 tourist_spot이랑 areacode 테이블 리턴 때리기
    if req.method == 'POST':
        try:
            conn = pymysql.connect(host=DB_info["host"], user=DB_info["user"],
                                   password=DB_info["password"], db=DB_info["db"], charset=DB_info["charset"])
            cur = conn.cursor(pymysql.cursors.DictCursor)
            query = "SELECT * FROM tourist_spot WHERE contenttypeid = '12'"
            cur.execute(query)
            tourist_spot_data = cur.fetchall()

            query = "SELECT * FROM areacode"
            cur.execute(query)
            area_code = cur.fetchall()

            cur.close()
            conn.close()

            shuffle(tourist_spot_data)
            final_response_data = {
                "touristSpot": tourist_spot_data,
                "areaCode": area_code
            }

            return JsonResponse(final_response_data, safe=False)
        except Exception as e:
            print(e)

#  ====aiPlanner====


@csrf_exempt
def aiPlanner(req):  # 프롬프트 작성
    if req.method == "POST":
        with open("app_dorock/config/Api_info.json", "r", encoding="utf-8") as data:
            API_info = json.load(data)

        data = json.loads(req.body.decode('utf-8'))
        prompt = (
            f"""
            다음 JSON 데이터를 참고하여 각 value 코드에 해당하는 추천 장소를 JSON 형식으로 반환해 주세요.

            JSON 데이터:
            {data}

            설명:
            - `region`과 `category`는 각각 여행지와 관련된 정보의 카테고리입니다.
            - `region`의 `key` 값들은 지역 이름이며, 그에 대한 `value`는 각 지역을 식별하는 코드입니다.
            - `category`의 `key` 값들은 활동이나 주제(레저, 역사 등)이며, 그에 대한 `value`는 카테고리 코드입니다.

            요청 사항:
            1. **반환 형식**은 `result`라는 JSON 객체 안에 넣어 반환해 주세요.
            2. 각 `value` 값을 `key`로 사용하여 결과를 반환하고, 모든 `key`에 대해 **항상 누락 없이 포함**해 주세요.
            3. **각 `value` 코드마다 추천 장소를 2개 이상 7개 이하씩 리스트 형식으로 제공**해 주세요.
            4. 모든 추천 장소는 **공백 없이 리스트 형식**으로 반환해 주세요.
            5. **반환 형식이 일정하게 유지되도록** 항상 동일한 구조로 제공해 주세요.
            6. JSON 형식의 응답을 위해, 응답에 여타 설명 없이 **JSON 데이터만 반환해 주세요**.
            7. recommendation 지시 사항
                - 각 지역에 대한값을 바탕으로 해당 지역의 여행을 추천하는 문장을 작성해 주세요.
                - 이 추천 문장은 **recommendation**이라는 키에 추가해 주세요.
            8. 관광지 이름은 짧게 반환해주세요.
            9. **최종 반환 예시**는 다음과 같은 형식을 따르도록 해 주세요:
                {{
                    "result": {{
                        "1": {{
                            "places": []
                        }},
                        "2": {{
                            "places": []
                        }},
                        "A04": {{
                            "places": []
                        }},
                        "recommendation": ""
                    }}
                }}
            - 요청한 형식 이외의 설명 없이 JSON 데이터만 반환해 주세요.
                    """
        )

        openai.api_key = API_info["openai"]

        # OpenAI API 호출 (gpt-3.5-turbo 모델 사용)
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",  # 4o-mini  gpt-3.5-turbo
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=700,  # 결과가 길 경우 max_tokens를 증가
            temperature=0.7
        )

        # 결과 반환
        gpt_response = json.loads(response.choices[0].message['content'])
        gpt_response = gpt_response["result"]
        print(gpt_response)

        category_dict = {
            "A01": "자연",
            "A02": "역사",
            "A03": "레저",
            "A04": "쇼핑"
        }

        gpt_comment = gpt_response["recommendation"]
        gpt_places = []

        category_options = []

        if (len(gpt_response) == 2):
            for key in gpt_response:
                if (key != "recommendation"):
                    gpt_places += gpt_response[key]["places"]
        else:
            for key in gpt_response:
                if key in category_dict:
                    gpt_places += gpt_response[key]["places"]
                    category_options.append(key)

        destinations_list = []
        for place in gpt_places:
            destinations_list.append(place)

        try:
            conn = pymysql.connect(host=DB_info["host"], user=DB_info["user"],
                                   password=DB_info["password"], db=DB_info["db"], charset=DB_info["charset"])
            cur = conn.cursor(pymysql.cursors.DictCursor)

            category_query = ""
            if category_options:
                category_query = " OR ".join([f"A.cat1 = '{category_option}'" for category_option in category_options])  # 카테고리 옵션을 주기 위한 쿼리
            else:
                category_query = "A.contenttypeid = '12'"

            query_conditions_str = " OR ".join(
                # 관광지 찾기 위한 쿼리
                [f"A.TITLE LIKE '%{destination}%'" for destination in destinations_list])

            # 쿼리 작성
            # query = f"SELECT * FROM tourist_spot WHERE contenttypeid = '12' AND ({query_conditions_str})"
            # query = f"SELECT * FROM non_blank_tourist_spot WHERE ({category_query}) AND ({
            #     query_conditions_str})"

            # 2024.11.08 공백 테이블 조인
            query = f"SELECT B.* FROM non_blank_tourist_spot A JOIN tourist_spot B ON A.contentid = B.contentid WHERE ({category_query}) AND ({query_conditions_str})"

            cur.execute(query)
            tourist_spot_data = cur.fetchall()

            print(f"{len(destinations_list)}개 중에 {len(tourist_spot_data)}개 반환")
            cur.close()
            conn.close()

            final_response_data = {
                "places": tourist_spot_data,
                "recommendation": gpt_comment
            }

            # print(final_response_data)

            # return JsonResponse(tourist_spot_data, safe=False)
            return JsonResponse(final_response_data, safe=False)
        except Exception as e:
            print(e)

#  ====detail====


@csrf_exempt
def detail(req):
    if req.method == "POST":
        with open("app_dorock/config/Api_info.json", "r", encoding="utf-8") as data:
            API_info = json.load(data)

        data = json.loads(req.body.decode('utf-8'))

        title = data.get("title")

        try:
            conn = pymysql.connect(
                host=DB_info["host"],
                user=DB_info["user"],
                password=DB_info["password"],
                db=DB_info["db"],
                charset=DB_info["charset"]
            )
            cur = conn.cursor(pymysql.cursors.DictCursor)

            # SQL 인젝션을 방지한 쿼리 실행
            query = "SELECT addr1,addr2, title, firstimage, mapx, mapy FROM tourist_spot WHERE title=%s"
            cur.execute(query, (title,))

            detail_data = cur.fetchall()

            # 연결 종료
            cur.close()
            conn.close()

            # 프롬프트
            prompt = (
                f"""
                요청사항:
                1. 관광지 : {title} 주소 : {detail_data[0]["addr1"]}에 대한 여행지 정보를 알려줘
                2. 반환 해줄때 **~~**을 빼줘.
                3. 3줄안으로 설명해줘
                """
            )

            openai.api_key = API_info["openai"]
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",  # 4o-mini  gpt-3.5-turbo
                messages=[{"role": "user", "content": prompt}],
                max_tokens=700,  # 결과가 길 경우 max_tokens를 증가
                temperature=0.7
            )

            gpt_response = response.choices[0].message['content']

            # 임시
            print(gpt_response)

            # JSON 응답에 필요한 데이터 추가
            response_data = {
                "title": detail_data[0]["title"],
                "addr1": detail_data[0]["addr1"],
                "addr2": detail_data[0]["addr2"],
                "mapx": detail_data[0]["mapx"],
                "mapy": detail_data[0]["mapy"],
                "image_path": detail_data[0]["firstimage"],
                "recommendation": gpt_response,
            }

            print(response_data)

            return JsonResponse(response_data)
        except Exception as e:
            print(e)


# 2024.11.12 tripInfoDetail 추가
@csrf_exempt
def tripInfoDetail(req):
    if req.method == "POST":
        with open("app_dorock/config/Api_info.json", "r", encoding="utf-8") as data:
            API_info = json.load(data)
            
        data = json.loads(req.body.decode('utf-8'))
        print(data)
        try:
            prompt = (
                f"""
                    요청사항:
                    {data["question"]}이 {data["title"]}와 거리가 멀면 응답을 "{data["title"]}에 대해 물어봐주세요." 정도로 응답해줘
                    만약 주어가 없다면 강원도의 {data["title"] + data["question"]}에 관련된 내용을 반환해주면 돼.
                """
            )
            openai.api_key = API_info["openai"]
            response = openai.ChatCompletion.create(
                model = "gpt-4o-mini",
                messages = [{"role" : "user" , "content":prompt}],
                # response_format={"type":"json"}
            )
            
            gpt_response = response.choices[0].message['content']
            
            print(gpt_response)
            
            return HttpResponse(gpt_response)

        except Exception as e:
            print(e)
            
            return HttpResponse("something wrong")


    
