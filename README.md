<h2 align="center" style="font-size: 20px;">Bài Toán Tóm Tắt Tập Ảnh CIFAR-10.</h1>

<p>
Bài toán <b>Dataset Summarization (Coreset Selection)</b> nhằm chọn ra một tập con dữ liệu nhỏ nhưng vẫn giữ được hiệu quả huấn luyện gần tương đương với toàn bộ tập dữ liệu ban đầu.
Đề tài sử dụng <b>K-Center Greedy</b> làm phương pháp chính và <b>Random Selection</b> làm baseline, dựa trên <b>embedding đặc trưng</b> trích xuất từ mô hình ResNet18.
</p>

<h2>1. Giới thiệu bài toán</h2>
<p>
Huấn luyện mô hình học sâu trên tập dữ liệu lớn đòi hỏi nhiều tài nguyên tính toán. Thay vì sử dụng toàn bộ dữ liệu, ta tìm một <b>coreset</b> — tập con nhỏ nhưng đại diện tốt cho phân bố dữ liệu gốc.
Mục tiêu là giảm kích thước dữ liệu huấn luyện nhưng vẫn duy trì độ chính xác cao.
</p>

<h2>2. Dataset: CIFAR10</h2>
<h3>2.1. Thông số cơ bản.</h3>

<table border="1" cellpadding="6" cellspacing="0">
<tr><th>Thuộc tính</th><th>Giá trị</th></tr>
<tr><td>Số lớp</td><td>10</td></tr>
<tr><td>Số ảnh train</td><td>50,000</td></tr>
<tr><td>Số ảnh test</td><td>10,000</td></tr>
<tr><td>Kích thước ảnh</td><td>32×32 RGB</td></tr>
</table>

<h3>2.2. Các lớp trong CIFAR-10</h3>

<table border="1" cellpadding="8" cellspacing="0">
<tr>
    <th>Icon</th>
    <th>Tên lớp</th>
    <th>Mô tả</th>
</tr>

<tr><td>✈️</td><td><b>Airplane</b></td><td>Máy bay</td></tr>
<tr><td>🚗</td><td><b>Automobile</b></td><td>Ô tô</td></tr>
<tr><td>🐦</td><td><b>Bird</b></td><td>Chim</td></tr>
<tr><td>🐱</td><td><b>Cat</b></td><td>Mèo</td></tr>
<tr><td>🦌</td><td><b>Deer</b></td><td>Hươu</td></tr>
<tr><td>🐶</td><td><b>Dog</b></td><td>Chó</td></tr>
<tr><td>🐸</td><td><b>Frog</b></td><td>Ếch</td></tr>
<tr><td>🐴</td><td><b>Horse</b></td><td>Ngựa</td></tr>
<tr><td>🚢</td><td><b>Ship</b></td><td>Tàu thủy</td></tr>
<tr><td>🚚</td><td><b>Truck</b></td><td>Xe tải</td></tr>
</table>

<h3>2.3. Giá trị chuẩn hóa</h3>
<pre><code>mean = (0.4914, 0.4822, 0.4465)
std  = (0.2023, 0.1994, 0.2010)</code></pre>

<h2>3. Mô hình trích xuất Embedding</h2>
<p>
Sử dụng <b>ResNet18</b> làm backbone. Thay vì chỉ dùng đầu ra phân loại, ta lấy <b>vector embedding</b> từ lớp trước fully-connected cuối cùng.
Embedding biểu diễn mỗi ảnh trong không gian đặc trưng sâu, phản ánh mức độ tương đồng giữa các ảnh.
</p>

<h2>4. Coreset là gì?</h2>
<p>
<b>Coreset</b> là một tập con nhỏ của dữ liệu huấn luyện nhưng vẫn giữ được các đặc trưng quan trọng của phân bố dữ liệu ban đầu. 
Huấn luyện trên coreset giúp giảm thời gian tính toán mà vẫn đạt độ chính xác gần với huấn luyện trên toàn bộ dữ liệu.
</p>

<h2>5. Random Selection (Baseline)</h2>
<ul>
<li>Chọn ngẫu nhiên k mẫu từ tập huấn luyện</li>
<li>Không sử dụng thông tin embedding</li>
<li>Dùng làm mốc so sánh</li>
</ul>

<h2>6. K-Center Greedy (Embedding-based)</h2>

<p><b>Ý tưởng:</b> Chọn các điểm dữ liệu bao phủ tốt nhất không gian đặc trưng.</p>

<ul>
<li>Trích xuất embedding cho toàn bộ tập train</li>
<li>Chọn một điểm đầu tiên</li>
<li>Lặp:
    <ul>
        <li>Tính khoảng cách từ mỗi điểm chưa chọn đến tập đã chọn</li>
        <li>Chọn điểm có khoảng cách lớn nhất</li>
    </ul>
</li>
<li>Dừng khi đủ kích thước coreset</li>
</ul>

<p>Phương pháp này giúp tránh chọn các mẫu dư thừa và tăng tính đại diện của tập con.</p>

<h2>7. Hướng dẫn sử dụng</h2>
<p>1. Tải code về máy</p>
<pre><code>git clone https://github.com/IchigoMazone/.applied_algorithm.git</code></pre>
<p>2. Di chuyển tới thư mục vừa tải</p>
<pre><code>cd .applied_algorithm</code></pre>
<p>3. Tải các thư viện liên quan</p>
<pre><code>pip install -r requirements.txt</code></pre>

<h2>8. Lệnh thực thi</h2>
<p>Thuật toán <b>Random (Baseline)</b></p>
<pre><code>!python main.py --dataset CIFAR10 --model ResNet18 --selection purerandom --fraction 0.1 --epochs 200 --num_exp 1 --save_path ./results</code></pre>
<p>Thuật toán <b>K-Center Greedy</b></p>
<pre><code>!python main.py --dataset CIFAR10 --model ResNet18 --selection kcenter --fraction 0.1 --epochs 200 --num_exp 1 --save_path ./results</code></pre>

<h2>9. Giải thích tham số lệnh chạy</h2> <table border="1" cellpadding="8" cellspacing="0"> <tr> <th>Tham số</th> <th>Ví dụ giá trị</th> <th>Ý nghĩa</th> </tr> <tr> <td><code>--dataset</code></td> <td>CIFAR10</td> <td>Bộ dữ liệu dùng để huấn luyện và đánh giá mô hình.</td> </tr> <tr> <td><code>--model</code></td> <td>ResNet18</td> <td>Kiến trúc mạng nơ-ron tích chập dùng để trích xuất đặc trưng và phân loại.</td> </tr> <tr> <td><code>--selection</code></td> <td>purerandom / kcenter</td> <td> Phương pháp chọn coreset: <ul> <li><b>purerandom</b>: Chọn ngẫu nhiên (baseline)</li> <li><b>kcenter</b>: Chọn mẫu dựa trên khoảng cách xa nhất trong không gian embedding (K-Center Greedy)</li> </ul> </td> </tr> <tr> <td><code>--fraction</code></td> <td>0.1</td> <td>Tỉ lệ dữ liệu huấn luyện được giữ lại làm coreset (0.1 = 10% tập train).</td> </tr> <tr> <td><code>--epochs</code></td> <td>200</td> <td>Số epoch huấn luyện mô hình trên tập dữ liệu đã chọn.</td> </tr> <tr> <td><code>--num_exp</code></td> <td>1</td> <td>Số lần lặp lại thí nghiệm để lấy kết quả trung bình và giảm nhiễu ngẫu nhiên.</td> </tr> <tr> <td><code>--save_path</code></td> <td>./results</td> <td>Thư mục lưu checkpoint mô hình, log huấn luyện và kết quả thực nghiệm.</td> </tr> </table>
<h2>10. Giá trị thực nghiệm</h2>

<p>Thuật toán <b>Random</b></p>
<pre><code>https://colab.research.google.com/drive/1bMr_MBz1DVaVnzBpg2e5mIrBWpSmY8ot?usp=sharing</code></pre>

<p>Thuật toán <b>K-Center Greedy</b></p>
<pre><code>https://colab.research.google.com/drive/1uvIXFzIiH66IZnEyJ6AqD9Ezo7zIdbob?usp=sharing</code></pre>



nhat965nhat965


