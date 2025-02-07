import json
import requests
import pymysql

#############################################################
####                                                     ####
####       DB 테이블 생성을 위해 한번만 실행할 코드         ####
####                                                     ####
#############################################################

with open("app_dorock/config/API_info.json", "r",encoding="utf-8") as data:
    API_info = json.load(data)

api_key = API_info["TourApi"]


def get_area_code(api_key=api_key):
    url = f"http://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey={api_key}&areaCode=32&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json"

    try:
        response = requests.get(url)
        response.raise_for_status()  # 상태 코드 확인

        # JSON 데이터 파싱
        area_code_json = response.json()
        return area_code_json
    except Exception as err:
        print(err)


def get_spot_data(api_key=api_key):
    url = f"http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey={api_key}&pageNo=1&_type=json&numOfRows=6000&MobileApp=AppTest&MobileOS=ETC&arrange=A&areaCode=32"

    try:
        response = requests.get(url)
        response.raise_for_status()  # 상태 코드 확인

        # JSON 데이터 파싱
        spot_data_json = response.json()
        return spot_data_json
    except Exception as err:
        print(err)


def create_areacode_table(cur):
    cur.execute(
        "CREATE TABLE areacode (rnum int(2) not null primary key, code char(2) not null, name char(10) not null);")

    area_code_json = get_area_code()
    area_code_json = area_code_json["response"]["body"]["items"]["item"]

    for areacode in area_code_json:
        try:
            sql = """insert into areacode values (%s, %s, %s);"""
            values = (
                areacode["rnum"],
                areacode["code"],
                areacode["name"]
            )
            cur.execute(sql, values)
            conn.commit()
        except pymysql.MySQLError as err:
            print(f"Database error: {err}")


def create_tourist_spot_table(cur):
    cur.execute("CREATE TABLE tourist_spot ( id int auto_increment primary key,addr1 VARCHAR(255) NOT NULL,addr2 VARCHAR(255),areacode VARCHAR(10),booktour VARCHAR(10),cat1 VARCHAR(10),cat2 VARCHAR(10),cat3 VARCHAR(10),contentid char(20) unique key,contenttypeid VARCHAR(10),createdtime DATETIME,firstimage VARCHAR(255),firstimage2 VARCHAR(255),cpyrhtDivCd VARCHAR(10),mapx DECIMAL(15, 10),mapy DECIMAL(15, 10),mlevel char(2),modifiedtime DATETIME,sigungucode VARCHAR(10),tel VARCHAR(255),title char(100),zipcode VARCHAR(10));")

    tourist_spot_json = get_spot_data()
    if tourist_spot_json:
        items = tourist_spot_json["response"]["body"]["items"]["item"]

        for tourist in items:
            try:
                sql = """INSERT INTO tourist_spot (
                            id, addr1, addr2, areacode, booktour, cat1, cat2, cat3, contentid,
                            contenttypeid, createdtime, firstimage, firstimage2, cpyrhtDivCd, mapx,
                            mapy, mlevel, modifiedtime, sigungucode, tel, title
                        ) VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                values = (
                    tourist.get("addr1", None),
                    tourist.get("addr2", None),
                    tourist.get("areacode", None),
                    tourist.get("booktour", None),
                    tourist.get("cat1", None),
                    tourist.get("cat2", None),
                    tourist.get("cat3", None),
                    tourist.get("contentid", None),
                    tourist.get("contenttypeid", None),
                    tourist.get("createdtime", None),
                    tourist.get("firstimage", None),
                    tourist.get("firstimage2", None),
                    tourist.get("cpyrhtDivCd", None),
                    tourist.get("mapx", None),
                    tourist.get("mapy", None),
                    tourist.get("mlevel", None),
                    tourist.get("modifiedtime", None),
                    tourist.get("sigungucode", None),
                    tourist.get("tel", None),
                    tourist.get("title", None),
                )
                cur.execute(sql, values)
                conn.commit()
            except pymysql.MySQLError as err:
                print(f"Database error: {err}")


def create_non_blank_tourist_spot_table(cur):
    cur.execute("CREATE TABLE non_blank_tourist_spot ( id int auto_increment primary key,addr1 VARCHAR(255) NOT NULL,addr2 VARCHAR(255),areacode VARCHAR(10),booktour VARCHAR(10),cat1 VARCHAR(10),cat2 VARCHAR(10),cat3 VARCHAR(10),contentid char(20) unique key,contenttypeid VARCHAR(10),createdtime DATETIME,firstimage VARCHAR(255),firstimage2 VARCHAR(255),cpyrhtDivCd VARCHAR(10),mapx DECIMAL(15, 10),mapy DECIMAL(15, 10),mlevel char(2),modifiedtime DATETIME,sigungucode VARCHAR(10),tel VARCHAR(255),title char(100),zipcode VARCHAR(10));")

    tourist_spot_json = get_spot_data()
    if tourist_spot_json:
        items = tourist_spot_json["response"]["body"]["items"]["item"]

        for tourist in items:
            tourist["title"] = "".join(tourist["title"].split(" "))
            try:
                sql = """INSERT INTO non_blank_tourist_spot (
                                id, addr1, addr2, areacode, booktour, cat1, cat2, cat3, contentid,
                                contenttypeid, createdtime, firstimage, firstimage2, cpyrhtDivCd, mapx,
                                mapy, mlevel, modifiedtime, sigungucode, tel, title
                            ) VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                values = (
                    tourist.get("addr1", None),
                    tourist.get("addr2", None),
                    tourist.get("areacode", None),
                    tourist.get("booktour", None),
                    tourist.get("cat1", None),
                    tourist.get("cat2", None),
                    tourist.get("cat3", None),
                    tourist.get("contentid", None),
                    tourist.get("contenttypeid", None),
                    tourist.get("createdtime", None),
                    tourist.get("firstimage", None),
                    tourist.get("firstimage2", None),
                    tourist.get("cpyrhtDivCd", None),
                    tourist.get("mapx", None),
                    tourist.get("mapy", None),
                    tourist.get("mlevel", None),
                    tourist.get("modifiedtime", None),
                    tourist.get("sigungucode", None),
                    tourist.get("tel", None),
                    tourist.get("title", None),
                )
                cur.execute(sql, values)
                conn.commit()
            except pymysql.MySQLError as err:
                print(f"Database error: {err}")

# 실행부
with open("app_dorock/config/DB_info.json", "r",encoding="utf-8") as data:
    DB_info = json.load(data)

conn = pymysql.connect(host=DB_info["host"], user=DB_info["user"], password=DB_info["password"], db=DB_info["db"], charset=DB_info["charset"])
cur = conn.cursor()

create_tourist_spot_table(cur)
create_areacode_table(cur)
create_non_blank_tourist_spot_table(cur)  # title의 공백 제거

cur.close()
conn.close()
