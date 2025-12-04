import { Popup } from "../components/PopUp.js";
import getUserId from "./getUserId.js";
import { updateCartCounter } from "./updateCartCounter.js";

const API_BASE = 'http://localhost:8000';

export async function addToCart(productId) {
    const popup = new Popup();

    const userId = getUserId();

    if (!userId) {
        window.location.href = '/fe/pages/home/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/carts/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId,
                quantity: 1
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {

            popup.show({
                title: "Thêm thành công!",
                content: `<p>Sản phẩm đã được thêm vào giỏ hàng của bạn.</p>`,
                actions: [
                    {
                        label: "OK",
                        type: "btn-primary",
                        close: true
                    }
                ]
            });

            await updateCartCounter(userId);

        } else {
            throw new Error(result.message || 'Không thể thêm sản phẩm vào giỏ');
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ:', error);

        popup.show({
            title: "Thêm thất bại!",
            content: `<p>Đã xảy ra lỗi: ${error.message}</p>`,
            actions: [
                { label: "Đóng", type: "btn-secondary", close: true }
            ]
        });
    }
}