---
order: 2
title: 字体
---

字体是体系化界面设计中最基本的构成之一，我们的用户通过文本来理解内容和完成工作，科学的字体系统将大大提升用户的阅读体验及工作效率。test

## 字体家族
根据不同的系统使用系统默认字体，常见的系统为：Windows、iOS/OS X、Android
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799604" width="816" height="554">


## 主字号
我们基于电脑显示器阅读距离（50 cm）以及最佳阅读角度（0.3）在字阶中选择了 14px作为主字号，以保证在多数常用显示器上的用户阅读效率最佳。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799616" width="640" height="240">


## 字阶与行高
字阶
在平台产品以及各种终端多样性的前提下，统一字阶，可以保证平台产品的统一性以及有效提高内部协作效率。

基于偶数原则再结合各个终端的业务场景，梳理出平台字阶。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799671" width="603" height="174">


各产品体验场景以及终端设备差异较大，根据常见的业务场景以及终端设备整理属于专用的字阶，

将平台字阶分为四类：网站类、后台类、移动端、POS端。

保证不同平台字阶的一致性，需要针对不同个人电脑和移动设备的字阶做单位区分，PC & OS平台使用px，IOS平台使用pt，Android平台使用sp

移动类平台（以 IOS 移动设备为载体，app、小程序、移动h5等）使用字阶的单位为 pt，以iphone 8为例，1pt = 2px。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799681" width="679" height="862">


原生App或小程序，可识别的最小字号为 10pt。移动H5类的产品，可识别的最小字号为 12pt。

若移动产品需要同时实现在App、小程序、移动H5等多平台上，需要注意最小字号的使用。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799729" width="579" height="223">

Android设备使用字阶单位为sp，以1920x1080的屏幕分辨率为例，1sp = 3px。

PT与SP均为不同系统的基本单位，没有太多实质差异。除POS设备以外，移动设备的字阶单位均以pt来举例。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129800218" width="680" height="671">

## 行高
行高指的是一行文字的底部，到下一行文字的底部。但在设计软件或者前端实现上，行高会自动等分在文字的上下部。

防止开发过程中出现文字被裁切的问题，所以行高略大于文字实际高度。

统一行高，保证平台中的文本应用统一，有秩序以及有效提高内部协作效率。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799747" width="800" height="260">


默认行高以字号大小的1.5倍的基础上，结合4 x 4基础网格调整的字体行高（行高=4n）。

以WEB端为例，字号为 14px ，则行高为1.5 x 14px=21，结合4n公式，得到 字号14px 的行高为20px。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799763" width="944" height="210">

保证字号数值一致，不作（px、pt）单位区分，下列是字号经过计算之后得到的行高，符合4 x 4的基础网格。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799770" width="1236" height="127">

当文本存在换行时，提供默认和宽松两种行高，以搭配不同的场景。

宽松的行高适合展示型网站以及文本内容较多的场景，如：新闻中心等。宽松行高的计算方式为「字号 x 2」。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799786" width="529" height="133">

典型案例：

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799791" width="800" height="320">

同模块下，必须使用相同的行高
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799802" width="1120" height="152">


典型案例：

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799820" width="800" height="726">

## 行间距
行间距指的是一行文字的底部，到下一行文字的顶部。

行间距会受行高的影响，行高越大，则行间距越大。

*这里行间距测量方式仅限于中文字，英文数字符号等均以中文字的测量方式为准
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799873" width="446" height="264">


行间距 ≈ 行高 - 字号，以14号字默认行高为例，20（默认行高）-14（字号）=6（默认行间距）。

下列提供几种常用字号的行间距作为参考，所提供的行间距并非绝对数值，仅供参考。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799882" width="938" height="133">

行间距的主要作用是用于文本的排版，区分文本与周围其他元素的关系，保证信息的有效传递以及具有引导性质。

若文本的上、下边距 > 文本的行间距，文本上下关联性较弱且不聚焦，不能很好的传递出它原有的信息。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799895" width="720" height="184">

## 行宽
行宽是指一行文字的长度。计算行宽的简单方法，使用RobertBringhurst的方法，以正文字号为基准，CPL（每行字符数）为45-75，约为27-40个中文字。

常用正文字号为14，则560（行宽）≈ 14（字号） * 40（CPL）。

*行宽会因为字体改变而改变，这里的行宽为参考值，非绝对值

制定行宽的目的是为了用户有更好的阅读体验，而不是为了单纯的制定规则。

当文本超过最大行宽（仅多出几个字符时）需要换行，可以精简文案或者是让它超过最大行宽，不建议强行换行。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799960" width="1200" height="813">


典型案例：

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799975" width="1200" height="400">

辅题类文本，使用最大行宽时，建议文本不超过 3 行。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799982" width="1200" height="858">

典型案例：

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129799988" width="1200" height="400">

## 字体组合
用不同的字阶、字重、灰度等搭配组合，能够吸引用户阅读，让内容更有效呈现。

常见的将文本分为：标题（核心内容）、辅题、正文、注释。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802040" width="400" height="220">


网页类和后台类的使用场景不同，展示型网页是通过标题图文等方式来引导用户阅读，所以其标题是核心，

而后台类则是通过状态、数据、关键操作等方式来让用户聚焦。

典型页面-展示型网站
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802043" width="1200" height="353">


典型页面-后台
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802068" width="1200" height="360">


组合规则
无论何种组合，其目的都是为了让信息更有效的传递，可以遵循以下 3 点：

· 对比

· 对齐

· 一致

对比
对比，文字可以通过字阶、灰度来拉开对比，更好的突出核心内容

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802095" width="1200" height="214">

典型页面-展示型网站
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802110" width="1200" height="360">


根据用户的阅读习惯，从左到右，从上往下，我们的文字编排方式需符合大多数用户的阅读习惯

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802117" width="640" height="343">

对齐
常见的文字排版方式为「左对齐」、「居中对齐」和「右对齐」。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802121" width="1200" height="206">


「左对齐」，工整清晰，符合用户阅读习惯，适用于大部分文字排版，长文本的文字组合建议使用左对齐的方式。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802127" width="1152" height="192">


使用「左对齐」文字组合时，若出现多行文字时，合理断句，建议最后一行比上面的文字内容短一些，保证后续内容阅读的连贯性。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802133" width="1152" height="312">

典型案例-展示型网站

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802138" width="1056" height="576">

典型页面-叙事簿，除金额与状态外，大部分的列表内容使用左对齐

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129867271" width="1180" height="705">

典型页面-叙事簿，左对齐的卡片内容

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129867292" width="1181" height="772">

常见的「居中对齐」有垂直居中对齐、水平居中对齐。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802164" width="1152" height="206">

水平「居中对齐」有更好的阅读连贯性，适用于较紧凑的垂直空间，建议通过字阶、字色、字重等方式拉开对比，突出核心内容。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802169" width="1104" height="214">


垂直「居中对齐」，端庄严肃，中断感强，适用于大模块标题组合，短文本的文字组合可以使用居中对齐的方式。不建议超过 3 行以及超长文本组合使用居中对齐。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802176" width="1112" height="536">

典型案例-网页，居中对齐的功能介绍
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802181" width="960" height="400">


典型案例-工作台，居中对齐的数据呈现
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802194" width="1112" height="629">


「右对齐」，移动端以及数据类组合较为常见，除数据类组合外较少场景会作为核心内容呈现。

如果要使用这种组合，建议不要在长文本组合以及多行文本组合内使用。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802209" width="1104" height="504">


典型页面-苍穹详情，列表内的金额采用右对齐

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802217" width="856" height="417">

典型页面-KIS o2o，合计区域金额使用右对齐
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802221" width="800" height="400">


一致
一致，同一功能模块下使用一致的「对比」「对齐」样式，保证用户阅读的一致性

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802228" width="1112" height="188">

典型页面-苍穹工作台，卡片信息内容的一致性
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802229" width="1183" height="468">


组合类型
文字常见组合类型为：标题类组合、数据类组合、图文类组合。

下面提供的为参考值，可以根据原则以及基础字号自行组合搭配。

展示型网站-组合类型
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802251" width="1152" height="738">


常见为「标题 + 描述」的字体组合，为了让文本层级更清晰，标题和描述的间距（a） ≥ 描述的行间距（b）。

推荐字体组合字间距为4n，n= {0，1，2，3，4，5，6，7，8，9，10…} 。

以正文字体14px为例，行高20px，行间距约为6px，结合基础网格数4 * 4，标题和描述的间距（a） ≥ 8。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802264" width="1152" height="412">

当标题与多行描述组合时，字间距 ≥ 行间距。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802270" width="1012" height="224">

相同的字体组合，允许在不同场景/模块下有多种字体组合间距，建议不超过 2 种。

相同模块下必须只允许有 1 种字体组合间距。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802294" width="1112" height="188">

数据类组合，常用语数据类展示。在内容复杂多变的数据列表页，大多数用户更愿意去阅读数字，所以核心信息就是「阿拉伯数字」。

该组合灵活多变，选择适合的方式进行组合
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802322" width="768" height="280">


推荐几种常用数据类组合方式。左（右）垂直式，可搭配图表、图标等其他信息来呈现。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802325" width="540" height="744">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802335" width="720" height="280">

居中垂直式，适用于较小的模块或是图表类。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802366" width="664" height="360">


当使用居中垂直式时，建议文字组合不超过 3 级。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802375" width="1104" height="232">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802378" width="431" height="745">

## 字体与图像
我们所看见的内容，都可以概括成一个个的盒子，卡片可以看作盒子，卡片内的文本、图表、图像等都可以概括为盒子。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802395" width="960" height="496">


字体与图像组合搭配，图像可以辅助文字传递信息、功能、情感等。文字能够让图像更好的理解，从而达到信息的有效传递。

常见字体与图像的关系为字体在图像外以及字体在图像内。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802401" width="1012" height="308">

图像内文本
根据图像的布局，划分出 9 个文本区域。通过用户阅读习惯，从左到右，从上至下，划分出盒子内的黄金区域。

盒子中的核心内容可能是图像或者是文字，首先确定盒子内的核心内容，从而制定文本的位置。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802417" width="1102" height="456">


当文本为核心内容时，建议文本在以下区域
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802428" width="1102" height="456">


当文字组合处于图像内时，字边距（a） > 字间距（b），字边距（c） > 字间距（b）

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802436" width="1012" height="176">

若盒子为图像时，以文本内容为核心或者是以图像为内容核心，不论核心内容是不是文本，任何情况下都要保证文本的阅读性

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802438" width="1060" height="307">

典型页面
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802440" width="1056" height="659">


图像为核心内容时，建议文本在以下区域
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802444" width="1102" height="456">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802450" width="1056" height="360">

图像外文字
以文字为中心制定出九宫格，根据图像与文字的关系顶出图像的位置。

图像外文字的图像，常见为图片、插图以及图标。
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802457" width="1102" height="456">




若盒子内容以图像为主，建议使用以下布局
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802464" width="1012" height="415">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802468" width="1056" height="891">

核心内容文本时，可以使用以下布局

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802521" width="1012" height="574">

典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802525" width="1058" height="1154">

当文本为核心内容时，可以使用以下布局

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802584" width="566" height="391">

当图像为图标时，常见为上下式布局和左右式布局。
上下式布局，利用垂直空间的布局，适合同一水平线上多模块或事更聚焦的场景，常用于功能介绍、导航图标等。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802595" width="420" height="272">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802627" width="1056" height="839">


左右式布局，利用水平空间的布局，图标前置，适合文字型按钮，

图标能够让文字具像化，更有效的传递信息。


<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802629" width="420" height="216">

典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802633" width="960" height="320">

图标后置，适合引导型按钮，如：进入、下拉、关闭等。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802638" width="420" height="216">

典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802641" width="638" height="351">


左右式布局加上文字组结合，需要根据场景选择适合的布局，下面列举两种基础样式作为参考。

布局一，图标阻断感强，常用于商品图片、Logo、头像等…
<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802650" width="420" height="248">


典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802658" width="934" height="547">


布局二，图标与标题成模块化，弱化图标，强调内容信息的呈现。

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802659" width="420" height="182">

典型页面

<img src="http://ikd.kingdee.com/kdrive/user/file?file_id=129802922" width="1161" height="505">
