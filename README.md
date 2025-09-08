Get today's puzzle at https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json
Get previous puzzles at 	https://www.nytimes.com/svc/crosswords/v6/editorial-content/puzzle/2020-07-05.json 

with the following headers

curl 'https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/2019-04-08.json' \
  --compressed \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Content-type: application/x-www-form-urlencoded' \
  -H 'X-Games-Auth-Bypass: true' \
  -H 'Connection: keep-alive' \
  -H 'Referer: https://www.nytimes.com/crosswords/game/mini/2019/04/08' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'TE: trailers'


You can highlight a cell by adding xwd__cell--highlighted to the class of the rect. For example:

<rect role="cell" tabindex="-1" aria-label="7A: Famous star-crossed lover, Answer: 5 letters, Letter: 0" id="cell-id-17" x="203.00" y="303.00" width="100.00" height="100.00" class="xwd__cell--cell xwd__cell--nested xwd__cell--highlighted"></rect>


You can highlight a hint by adding xwd__clue--selected to the class of the li. For example:

<li class="xwd__clue--li xwd__clue--selected"><span class="xwd__clue--label">4</span><span class="xwd__clue--text xwd__clue-format">Surplus</span></li>



Also

xwd__assistance--confirmed

.xwd__assistance--confirmed ~ text:last-of-type {
	fill: #2860d8;
}
