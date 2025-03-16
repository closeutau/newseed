router.get(/^\/RecentChanges$/, async function recentChanges(req, res) {
	var flag = req.query['logtype'];
	if(!['all', 'create', 'delete', 'move', 'revert'].includes(flag)) flag = 'all';
	
	var data = await curs.execute("select isapi, flags, title, namespace, rev, time, changes, log, iserq, erqnum, advance, ismember, username, loghider from history \
					where " + (flag == 'all' ? "not namespace = '사용자' and " : '') + "advance like ? order by cast(time as integer) desc limit 100", 
					[flag == 'all' ? '%' : flag]);
	
	var content = '';

	// TODO: CSS 가져오기
	if(ver('4.22.9')) {
		content += `
			<div data-v-8acaac43="" class="L8YpP+V4 jg9kG4bj">
				<div class="q-4uA3Ke">
    					<div class="t87KNyhI">
						<ul class="fUuY8L90">
							<li><a href="/RecentChanges?logtype=all" class="MHA4383u${flag == 'all' ? ' CYgSDE5u' : ''}">전체</a></li>
							<li><a href="/RecentChanges?logtype=create" class="MHA4383u${flag == 'create' ? ' CYgSDE5u' : ''}">새 문서</a></li>
							<li><a href="/RecentChanges?logtype=delete" class="MHA4383u${flag == 'delete' ? ' CYgSDE5u' : ''}">삭제</a></li>
							<li><a href="/RecentChanges?logtype=move" class="MHA4383u${flag == 'move' ? ' CYgSDE5u' : ''}">이동</a></li>
							<li><a href="/RecentChanges?logtype=revert" class="MHA4383u${flag == 'revert' ? ' CYgSDE5u' : ''}">되돌림</a></li>
						</ul>
					</div>
				</div>

				<div class="zhjlwzUJ _5KRai88T" style="opacity: 0;"></div>
				<div class="zhjlwzUJ" style="opacity: 0; display: none;"></div>
			</div>
			
			<div class=-Yy3Y6nP data-v-94a6588c>
				<div data-v-94a6588c="" class="NfJT3FPE DjsdhWRC">
					<div data-v-94a6588c="" class="c0O2TLGQ">문서</div> 
					<div data-v-94a6588c="" class="c0O2TLGQ">기능</div> 
					<div data-v-94a6588c="" class="c0O2TLGQ">수정자</div> 
					<div data-v-94a6588c="" class="c0O2TLGQ">수정 시간</div>
				</div>
		`;
	} else {
		content += `
			<ol class="breadcrumb link-nav">
				<li><a href="?logtype=all">[전체]</a></li>
				<li><a href="?logtype=create">[새 문서]</a></li>
				<li><a href="?logtype=delete">[삭제]</a></li>
				<li><a href="?logtype=move">[이동]</a></li>
				<li><a href="?logtype=revert">[되돌림]</a></li>
			</ol>
			
			<table class="table table-hover">
				<colgroup>
					<col>
					<col style="width: 25%;">
					<col style="width: 22%;">
				</colgroup>
				
				<thead id>
					<tr>
						<th>항목</th>
						<th>수정자</th>
						<th>수정 시간</th>
					</tr>
				</thead>
				
				<tbody id>
		`;
	}
	
	if(ver('4.22.9')) for(var row of data) {
		var title = totitle(row.title, row.namespace) + '';
		
		content += `
				<div class=NfJT3FPE data-v-94a6588c>
					<div class=c0O2TLGQ data-v-94a6588c>
						<a href="/w/${encodeURIComponent(title)}">${html.escape(title)}</a> 
						<span class="MY5yAwDg${Number(row.changes) > 0
								? ' d+Pid0zt'
								: (
									Number(row.changes) < 0
									? ' a7gtkJvH'
									: ''
								)}" data-v-6cbb5b59 data-v-94a6588c>${row.changes}</span>
					</div>
					
					<div class=c0O2TLGQ data-v-94a6588c>
						<div class="_4HlR7Xk+" data-v-94a6588c>
							<a class=sx7-yPnI data-v-94a6588c title="역사" href="/history/${encodeURIComponent(title)}">역사</a> 
							${
									Number(row.rev) > 1
									? '<a class=sx7-yPnI data-v-94a6588c title="비교" href="/diff/' + encodeURIComponent(title) + '?rev=' + row.rev + '&oldrev=' + String(Number(row.rev) - 1) + '">비교</a>'
									: ''
							} 
							<a class=sx7-yPnI data-v-94a6588c title="토론" href="/discuss/${encodeURIComponent(title)}">토론</a> 
						</div>
					</div>
					
					<div class=c0O2TLGQ data-v-94a6588c>
						${ip_pas(row.username, row.ismember)}${ver('4.20.0') && row.isapi ?' <i>(API)</i>' : ''}
					</div>
					
					<div class=c0O2TLGQ data-v-94a6588c>
						${formatRelativeDate(row.time)}
					</div>
		`;
		
		if((row.log.length > 0 && !row.loghider) || row.advance != 'normal') {
			content += `
				<div class="c0O2TLGQ i80SVicp" data-v-94a6588c>
					<span data-v-94a6588c>${row.loghider ? '' : row.log}</span> ${row.advance != 'normal' ? `<i data-v-94a6588c>(${edittype(row.advance, ...(row.flags.split('\n')))})</i>` : ''}
				</div>
			`;
		} else {
			content += '<!---->';
		}
		
		content += '</div>';
	} else for(var row of data) {
		var title = totitle(row.title, row.namespace) + '';
		
		content += `
				<tr${(row.log.length > 0 || row.advance != 'normal' ? ' class=no-line' : '')}>
					<td>
						<a href="/w/${encodeURIComponent(title)}">${html.escape(title)}</a> 
						<a href="/history/${encodeURIComponent(title)}">[역사]</a> 
						${
								Number(row.rev) > 1
								? '<a href="/diff/' + encodeURIComponent(title) + '?rev=' + row.rev + '&oldrev=' + String(Number(row.rev) - 1) + '">[비교]</a>'
								: ''
						} 
						<a href="/discuss/${encodeURIComponent(title)}">[토론]</a> 
						
						<span class=f_r>(<span style="color: ${
							(
								Number(row.changes) > 0
								? 'green'
								: (
									Number(row.changes) < 0
									? 'red'
									: 'gray'
								)
							)
							
						};">${row.changes}</span>)</span>
					</td>
					
					<td>
						${ip_pas(row.username, row.ismember)}${ver('4.20.0') && row.isapi ?' <i>(API)</i>' : ''}
					</td>
					
					<td>
						${generateTime(toDate(row.time), timeFormat)}
					</td>
				</tr>
		`;
		
		if((row.log.length > 0 && !row.loghider) || row.advance != 'normal') {
			content += `
				<td colspan="3" style="padding-left: 1.5rem;">
					${row.loghider ? '' : row.log} ${row.advance != 'normal' ? `<i>(${edittype(row.advance, ...(row.flags.split('\n')))})</i>` : ''}
				</td>
			`;
		}
	}
	
	if(ver('4.22.9')) {
		content += `</div>`;
	} else {
		content += `
				</tbody>
			</table>
		`;
	}
	
	res.send(await render(req, '최근 변경내역', content, {}));
});
